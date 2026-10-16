"""Configuration lue depuis l'environnement et le fichier .env."""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # --- LLM (LM Studio, API compatible OpenAI) ---
    llm_base_url: str = "http://localhost:1234/v1"
    llm_api_key: str = "lm-studio"
    llm_model: str = "qwen3.6-35b-a3b"
    llm_quant: str = "Q3 (~15 Go)"
    llm_context: int = 32768
    llm_max_tokens: int = 2048
    llm_max_tokens_thinking: int = 8192
    llm_timeout_s: float = 900.0
    llm_temperature_structured: float = 0.2
    llm_temperature_thinking: float = 0.6
    llm_top_p: float = 0.95

    # --- Embeddings (servis aussi par LM Studio) ---
    embed_model: str = "text-embedding-qwen3-embedding-0.6b"
    embed_dims: int = 1024

    # --- Persistance ---
    # Vide = mode mémoire (pas de reprise possible après arrêt).
    database_url: str = "postgresql://agents:agents@localhost:5432/agents"

    # --- Recherche web ---
    searxng_url: str = "http://localhost:8080"
    search_results: int = 3
    fetch_max_chars: int = 4000

    # --- Bac à sable ---
    # docker : conteneur isolé (recommandé). local : sous-processus, SANS isolation (tests uniquement).
    sandbox_mode: Literal["docker", "local"] = "docker"
    sandbox_image: str = "agents-sandbox:latest"
    sandbox_memory: str = "512m"
    sandbox_cpus: str = "1"
    sandbox_timeout_s: int = 60
    sandbox_install_timeout_s: int = 300

    # --- Dossiers ---
    workspaces_dir: Path = Path("workspaces")
    logs_dir: Path = Path("logs")

    # --- Budgets et garde-fous ---
    max_iterations: int = 50
    max_duration_min: int = 180
    max_llm_calls: int = 300
    max_attempts: int = 3
    max_replan_depth: int = 2
    alert_json_invalid_rate: float = 0.15
    alert_max_attempt_share: float = 1 / 3

    @property
    def prompt_budget_tokens(self) -> int:
        """Tokens disponibles pour l'entrée : contexte moins la réponse, avec une marge."""
        return int((self.llm_context - self.llm_max_tokens_thinking) * 0.9)


@lru_cache
def get_settings() -> Settings:
    return Settings()
