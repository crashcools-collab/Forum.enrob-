"""Schémas des sorties structurées. Volontairement petits et plats : un modèle quantifié
en 3 bits les respecte bien mieux qu'un schéma imbriqué avec des champs optionnels."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class PlannedTask(BaseModel):
    title: str = Field(description="Titre court de la tâche")
    description: str = Field(description="Ce qu'il faut produire, précisément")
    acceptance: str = Field(description="Critère d'acceptation vérifiable par un test pytest")
    needs_research: bool = Field(description="true seulement si une information externe est indispensable")
    depends_on: list[int] = Field(description="Numéros (1, 2, ...) des tâches dont celle-ci dépend")


class Plan(BaseModel):
    tasks: list[PlannedTask] = Field(min_length=1, max_length=12)


class SearchQuery(BaseModel):
    query: str = Field(description="Requête web courte et précise")


class ResearchNote(BaseModel):
    summary: str = Field(description="Synthèse utile pour la tâche, faits concrets uniquement")
    sources: list[str] = Field(description="URL réellement utilisées")


class FailureAnalysis(BaseModel):
    probable_cause: str = Field(description="Cause probable de l'échec, en une ou deux phrases")
    fix_hint: str = Field(description="Correction concrète à apporter au code")
    test_is_wrong: bool = Field(description="true seulement si c'est le test lui-même qui est faux")


class Replan(BaseModel):
    decision: Literal["split", "block"] = Field(description="split : redécouper ; block : abandonner la tâche")
    reason: str
    new_tasks: list[PlannedTask] = Field(description="Sous-tâches si split, liste vide si block", max_length=4)
