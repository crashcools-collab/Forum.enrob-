"""Assemblage du graphe LangGraph (pattern superviseur).

    START → plan → route ─┬→ researcher ──┐
                          ├→ developer ───┤
                          ├→ approve_deps ┤  (interrupt : validation humaine)
                          ├→ tester ──────┤
                          ├→ replan ──────┘→ route
                          └→ finish → END
"""

from __future__ import annotations

from langgraph.graph import END, START, StateGraph

from agents.nodes.developer import make_approve_deps_node, make_developer_node
from agents.nodes.manager import make_finish_node, make_plan_node, make_replan_node, make_route_node
from agents.nodes.researcher import make_researcher_node
from agents.nodes.tester import make_tester_node
from agents.state import AgentState, Deps

ROUTES = {
    "research": "researcher",
    "develop": "developer",
    "approve_deps": "approve_deps",
    "test": "tester",
    "replan": "replan",
    "finish": "finish",
}


def build_graph(deps: Deps, checkpointer=None, store=None):
    g = StateGraph(AgentState)
    g.add_node("plan", make_plan_node(deps))
    g.add_node("route", make_route_node(deps))
    g.add_node("researcher", make_researcher_node(deps))
    g.add_node("developer", make_developer_node(deps))
    g.add_node("approve_deps", make_approve_deps_node(deps))
    g.add_node("tester", make_tester_node(deps))
    g.add_node("replan", make_replan_node(deps))
    g.add_node("finish", make_finish_node(deps))

    g.add_edge(START, "plan")
    g.add_edge("plan", "route")
    g.add_conditional_edges("route", lambda s: ROUTES[s["next_agent"]], list(ROUTES.values()))
    for worker in ("researcher", "developer", "approve_deps", "tester", "replan"):
        g.add_edge(worker, "route")
    g.add_edge("finish", END)
    return g.compile(checkpointer=checkpointer, store=store)


def recursion_limit(deps: Deps) -> int:
    # Chaque itération = route + un agent ; marge pour plan, finish et le résumé d'historique.
    return deps.settings.max_iterations * 2 + 10
