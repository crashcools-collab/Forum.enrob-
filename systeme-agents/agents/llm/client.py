"""Couche LLM : appels séquentiels à LM Studio, sorties structurées robustes, métriques.

On utilise directement le SDK `openai` plutôt que ChatOpenAI : il donne accès à
`reasoning_content` et à `usage` sans couche intermédiaire, et LangGraph n'a pas besoin
d'objets LangChain pour fonctionner.
"""

from __future__ import annotations

import json
import threading
import time
from dataclasses import dataclass
from typing import Any, Protocol, TypeVar

from pydantic import BaseModel, ValidationError

from agents.config import Settings
from agents.llm.json_repair import extract_json, strip_think
from agents.logs import log_event

T = TypeVar("T", bound=BaseModel)


class LLMError(RuntimeError):
    """Le serveur LLM est injoignable ou a renvoyé une erreur."""


class LLMFormatError(RuntimeError):
    """Le modèle n'a pas produit de JSON valide malgré les réparations."""


@dataclass
class RawResponse:
    content: str
    reasoning: str
    prompt_tokens: int
    completion_tokens: int


class Backend(Protocol):
    def chat(self, messages: list[dict], **params: Any) -> RawResponse: ...
    def embed(self, texts: list[str]) -> list[list[float]]: ...
    def list_models(self) -> list[str]: ...


class OpenAIBackend:
    """Serveur compatible OpenAI (LM Studio)."""

    def __init__(self, settings: Settings):
        from openai import OpenAI

        self.settings = settings
        self.client = OpenAI(
            base_url=settings.llm_base_url,
            api_key=settings.llm_api_key,
            timeout=settings.llm_timeout_s,
            max_retries=1,
        )

    def chat(self, messages: list[dict], **params: Any) -> RawResponse:
        try:
            resp = self.client.chat.completions.create(
                model=self.settings.llm_model, messages=messages, **params
            )
        except Exception as exc:  # erreurs réseau, 4xx/5xx
            raise LLMError(f"Appel LLM impossible : {exc}") from exc
        msg = resp.choices[0].message
        extra = msg.model_extra or {}
        reasoning = extra.get("reasoning_content") or extra.get("reasoning") or ""
        usage = resp.usage
        return RawResponse(
            content=msg.content or "",
            reasoning=reasoning if isinstance(reasoning, str) else json.dumps(reasoning),
            prompt_tokens=getattr(usage, "prompt_tokens", 0) or 0,
            completion_tokens=getattr(usage, "completion_tokens", 0) or 0,
        )

    def embed(self, texts: list[str]) -> list[list[float]]:
        try:
            resp = self.client.embeddings.create(model=self.settings.embed_model, input=texts)
        except Exception as exc:
            raise LLMError(f"Embeddings impossibles : {exc}") from exc
        return [d.embedding for d in resp.data]

    def list_models(self) -> list[str]:
        try:
            return [m.id for m in self.client.models.list().data]
        except Exception as exc:
            raise LLMError(f"Serveur LLM injoignable ({self.settings.llm_base_url}) : {exc}") from exc


def estimate_tokens(text: str) -> int:
    """Estimation grossière (≈ 3 caractères par token pour du français et du code)."""
    return len(text) // 3 + 1


class LLMClient:
    """Point d'entrée unique des agents vers le modèle.

    - Un verrou global : un seul appel à la fois (le modèle partage la VRAM et la RAM).
    - Chaque appel produit une métrique, récupérée par les nœuds via `drain_metrics()`.
    """

    _lock = threading.Lock()

    def __init__(self, settings: Settings, backend: Backend | None = None):
        self.settings = settings
        self.backend = backend or OpenAIBackend(settings)
        self._metrics: list[dict] = []
        self.last_reasoning = ""

    # ------------------------------------------------------------------ appels bruts

    def _call(
        self,
        *,
        agent: str,
        messages: list[dict],
        thinking: bool,
        temperature: float,
        max_tokens: int,
        response_format: dict | None = None,
    ) -> tuple[RawResponse, float]:
        params: dict[str, Any] = {
            "temperature": temperature,
            "top_p": self.settings.llm_top_p,
            "max_tokens": max_tokens,
            "extra_body": {"chat_template_kwargs": {"enable_thinking": thinking}},
        }
        if response_format:
            params["response_format"] = response_format
        with self._lock:
            start = time.monotonic()
            raw = self.backend.chat(messages, **params)
            duration = time.monotonic() - start
        self.last_reasoning = raw.reasoning
        if raw.reasoning:
            log_event("llm_reasoning", agent=agent, chars=len(raw.reasoning), text=raw.reasoning[:4000])
        return raw, duration

    def _record(self, agent: str, kind: str, thinking: bool, raw: RawResponse, duration: float, json_status: str | None):
        metric = {
            "agent": agent,
            "kind": kind,
            "thinking": thinking,
            "duration_s": round(duration, 2),
            "prompt_tokens": raw.prompt_tokens,
            "completion_tokens": raw.completion_tokens,
            "tokens_per_s": round(raw.completion_tokens / duration, 1) if duration > 0 else 0.0,
            "json": json_status,
        }
        self._metrics.append(metric)
        log_event(
            "llm_call",
            message=f"{agent} {duration:.0f} s, {raw.completion_tokens} tokens ({metric['tokens_per_s']} t/s)"
            + (f", JSON {json_status}" if json_status else "")
            + (", réponse vide" if not raw.content.strip() else ""),
            **metric,
        )

    def drain_metrics(self) -> list[dict]:
        out, self._metrics = self._metrics, []
        return out

    # ------------------------------------------------------------------ API publique

    def text(self, *, agent: str, system: str, user: str, thinking: bool = True, max_tokens: int | None = None) -> str:
        """Réponse libre (code, synthèse). Le raisonnement est journalisé, jamais renvoyé."""
        messages = [{"role": "system", "content": system}, {"role": "user", "content": user}]
        temperature = self.settings.llm_temperature_thinking if thinking else self.settings.llm_temperature_structured
        max_tokens = max_tokens or (self.settings.llm_max_tokens_thinking if thinking else self.settings.llm_max_tokens)
        raw, duration = self._call(
            agent=agent, messages=messages, thinking=thinking, temperature=temperature, max_tokens=max_tokens
        )
        self._record(agent, "text", thinking, raw, duration, None)
        return strip_think(raw.content)

    def structured(self, *, agent: str, system: str, user: str, schema: type[T], thinking: bool = False) -> T:
        """Sortie JSON validée par Pydantic.

        Ordre de récupération, du moins cher au plus cher :
        1. validation directe ;
        2. extraction/réparation du JSON dans le texte (gratuit, sans appel) ;
        3. un second appel en renvoyant l'erreur de validation au modèle (+ extraction).
        Sans thinking, on impose aussi le schéma côté serveur (response_format), ce qui
        contraint la génération. Avec thinking, on ne l'impose pas : la grammaire empêcherait
        le modèle de raisonner avant de répondre.
        """
        schema_json = json.dumps(schema.model_json_schema(), ensure_ascii=False)
        system_full = (
            f"{system}\n\nRéponds UNIQUEMENT avec un objet JSON valide conforme à ce schéma, "
            f"sans texte autour :\n{schema_json}"
        )
        messages = [{"role": "system", "content": system_full}, {"role": "user", "content": user}]
        response_format = None
        if not thinking:
            response_format = {
                "type": "json_schema",
                "json_schema": {"name": schema.__name__, "schema": schema.model_json_schema(), "strict": True},
            }
        temperature = self.settings.llm_temperature_thinking if thinking else self.settings.llm_temperature_structured
        max_tokens = self.settings.llm_max_tokens_thinking if thinking else self.settings.llm_max_tokens

        raw, duration = self._call(
            agent=agent,
            messages=messages,
            thinking=thinking,
            temperature=temperature,
            max_tokens=max_tokens,
            response_format=response_format,
        )
        result, status, error = self._parse(schema, raw.content)
        if result is not None:
            self._record(agent, "structured", thinking, raw, duration, status)
            return result
        self._record(agent, "structured", thinking, raw, duration, "invalid")

        retry_messages = messages + [
            {"role": "assistant", "content": raw.content[:4000]},
            {
                "role": "user",
                "content": f"Ta réponse n'est pas un JSON valide pour le schéma. Erreur : {error}\n"
                "Renvoie uniquement l'objet JSON corrigé.",
            },
        ]
        raw2, duration2 = self._call(
            agent=agent,
            messages=retry_messages,
            thinking=False,
            temperature=self.settings.llm_temperature_structured,
            max_tokens=self.settings.llm_max_tokens,
            response_format={
                "type": "json_schema",
                "json_schema": {"name": schema.__name__, "schema": schema.model_json_schema(), "strict": True},
            },
        )
        result, _, error = self._parse(schema, raw2.content)
        self._record(agent, "structured_retry", False, raw2, duration2, "retry_valid" if result else "failed")
        if result is not None:
            return result
        log_event("llm_format_error", agent=agent, error=str(error)[:500], content=raw2.content[:2000])
        raise LLMFormatError(f"{agent} : JSON invalide après réparation ({error})")

    @staticmethod
    def _parse(schema: type[T], content: str) -> tuple[T | None, str, str]:
        cleaned = strip_think(content)
        try:
            return schema.model_validate_json(cleaned), "valid", ""
        except ValidationError as exc:
            error = str(exc)
        data = extract_json(cleaned)
        if data is not None:
            try:
                return schema.model_validate(data), "repaired", ""
            except ValidationError as exc:
                error = str(exc)
        return None, "invalid", error[:1500]

    def embed(self, texts: list[str]) -> list[list[float]]:
        with self._lock:
            return self.backend.embed(texts)
