"""Extraction et réparation de JSON dans une sortie de modèle imparfaite.

Un modèle quantifié en 3 bits enrobe souvent son JSON (balises ```json, texte avant/après,
virgules finales). On tente des réparations simples et sûres ; pas de devinette sur le contenu.
"""

from __future__ import annotations

import json
import re

_THINK_RE = re.compile(r"<think>.*?</think>", re.DOTALL)
_FENCE_RE = re.compile(r"```(?:json)?\s*(.*?)```", re.DOTALL)
_TRAILING_COMMA_RE = re.compile(r",\s*([}\]])")


def strip_think(text: str) -> str:
    """Retire un raisonnement laissé en ligne dans la réponse (<think>...</think>)."""
    text = _THINK_RE.sub("", text)
    # Balise ouvrante sans fermeture : le modèle a été coupé pendant qu'il réfléchissait.
    if "<think>" in text:
        text = text.split("<think>", 1)[0]
    # Fermeture orpheline : le template a déjà consommé la balise ouvrante.
    if "</think>" in text:
        text = text.split("</think>", 1)[1]
    return text.strip()


def _balanced_object(text: str) -> str | None:
    """Premier objet JSON {...} équilibré, en respectant les chaînes."""
    start = text.find("{")
    while start != -1:
        depth = 0
        in_str = False
        escape = False
        for i in range(start, len(text)):
            ch = text[i]
            if in_str:
                if escape:
                    escape = False
                elif ch == "\\":
                    escape = True
                elif ch == '"':
                    in_str = False
                continue
            if ch == '"':
                in_str = True
            elif ch == "{":
                depth += 1
            elif ch == "}":
                depth -= 1
                if depth == 0:
                    return text[start : i + 1]
        start = text.find("{", start + 1)
    return None


def extract_json(text: str) -> dict | None:
    """Renvoie le premier objet JSON exploitable trouvé dans `text`, ou None."""
    text = strip_think(text)
    candidates: list[str] = [text]
    candidates += [m.strip() for m in _FENCE_RE.findall(text)]
    obj = _balanced_object(text)
    if obj:
        candidates.append(obj)

    for raw in candidates:
        for attempt in (raw, _TRAILING_COMMA_RE.sub(r"\1", raw)):
            try:
                value = json.loads(attempt)
            except (json.JSONDecodeError, TypeError):
                continue
            if isinstance(value, dict):
                return value
    return None
