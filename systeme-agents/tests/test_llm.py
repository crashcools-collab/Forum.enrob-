import pytest

from agents.llm.client import LLMFormatError
from agents.llm.json_repair import extract_json, strip_think
from agents.schemas import FailureAnalysis, SearchQuery


def test_strip_think_variants():
    assert strip_think("<think>blabla</think>\nRéponse") == "Réponse"
    assert strip_think("raisonnement</think>Réponse") == "Réponse"
    assert strip_think("Début<think>coupé en plein") == "Début"


@pytest.mark.parametrize(
    "text",
    [
        '{"query": "x"}',
        'Voici :\n```json\n{"query": "x"}\n```',
        'Bien sûr ! {"query": "x",} Voilà.',
        '<think>hmm {pas du json}</think>{"query": "x"}',
        'texte {"query": "x avec } accolade"} fin',
    ],
)
def test_extract_json(text):
    data = extract_json(text)
    assert data is not None and data["query"].startswith("x")


def test_extract_json_none():
    assert extract_json("aucun json ici") is None


def test_structured_valid_uses_server_schema(make_llm):
    llm, backend = make_llm({"query": [{"query": "python zoneinfo"}]})
    from agents import prompts

    out = llm.structured(agent="recherche", system=prompts.RESEARCH_QUERY, user="u", schema=SearchQuery)
    assert out.query == "python zoneinfo"
    params = backend.calls[0]["params"]
    assert params["response_format"]["type"] == "json_schema"
    assert params["extra_body"]["chat_template_kwargs"]["enable_thinking"] is False
    assert llm.drain_metrics()[0]["json"] == "valid"


def test_structured_thinking_has_no_grammar_and_repairs(make_llm):
    from agents import prompts

    reply = 'Analyse faite.\n```json\n{"probable_cause": "c", "fix_hint": "f", "test_is_wrong": false,}\n```'
    llm, backend = make_llm({"test_analyze": [reply]})
    out = llm.structured(agent="testeur", system=prompts.TESTER_ANALYZE, user="u", schema=FailureAnalysis, thinking=True)
    assert out.probable_cause == "c"
    assert "response_format" not in backend.calls[0]["params"]
    assert llm.drain_metrics()[0]["json"] == "repaired"


def test_structured_retry_then_failure(make_llm):
    from agents import prompts

    llm, backend = make_llm({"query": ["pas du json", {"query": "ok"}]})
    out = llm.structured(agent="recherche", system=prompts.RESEARCH_QUERY, user="u", schema=SearchQuery)
    assert out.query == "ok"
    assert [m["json"] for m in llm.drain_metrics()] == ["invalid", "retry_valid"]
    # Le second appel renvoie l'erreur au modèle.
    assert "n'est pas un JSON valide" in backend.calls[1]["messages"][-1]["content"]

    llm, _ = make_llm({"query": ["toujours rien"]})
    with pytest.raises(LLMFormatError):
        llm.structured(agent="recherche", system=prompts.RESEARCH_QUERY, user="u", schema=SearchQuery)
    assert [m["json"] for m in llm.drain_metrics()] == ["invalid", "failed"]
