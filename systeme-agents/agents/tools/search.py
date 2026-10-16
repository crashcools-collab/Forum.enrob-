"""Recherche web via SearXNG (API JSON) et lecture de pages en texte brut."""

from __future__ import annotations

import re
from dataclasses import dataclass
from html.parser import HTMLParser

import httpx

from agents.config import Settings

_USER_AGENT = "Mozilla/5.0 (compatible; agents-recherche/1.0)"


@dataclass
class SearchHit:
    title: str
    url: str
    snippet: str


class SearchError(RuntimeError):
    pass


class _TextExtractor(HTMLParser):
    _SKIP = {"script", "style", "noscript", "svg", "nav", "footer", "header", "form"}

    def __init__(self):
        super().__init__()
        self.parts: list[str] = []
        self._skip_depth = 0

    def handle_starttag(self, tag, attrs):
        if tag in self._SKIP:
            self._skip_depth += 1

    def handle_endtag(self, tag):
        if tag in self._SKIP and self._skip_depth:
            self._skip_depth -= 1

    def handle_data(self, data):
        if not self._skip_depth and data.strip():
            self.parts.append(data.strip())


def html_to_text(html: str) -> str:
    parser = _TextExtractor()
    parser.feed(html)
    return re.sub(r"\s+", " ", " ".join(parser.parts)).strip()


class WebSearch:
    def __init__(self, settings: Settings, http: httpx.Client | None = None):
        self.s = settings
        self.http = http or httpx.Client(timeout=20, follow_redirects=True, headers={"User-Agent": _USER_AGENT})

    def search(self, query: str) -> list[SearchHit]:
        try:
            resp = self.http.get(f"{self.s.searxng_url.rstrip('/')}/search", params={"q": query, "format": "json"})
            resp.raise_for_status()
            data = resp.json()
        except (httpx.HTTPError, ValueError) as exc:
            raise SearchError(f"SearXNG indisponible ou format JSON désactivé : {exc}") from exc
        hits = []
        for r in data.get("results", [])[: self.s.search_results]:
            if r.get("url"):
                hits.append(SearchHit(title=r.get("title", ""), url=r["url"], snippet=r.get("content", "")))
        return hits

    def fetch_text(self, url: str) -> str:
        try:
            resp = self.http.get(url)
            resp.raise_for_status()
        except httpx.HTTPError as exc:
            return f"(page illisible : {exc})"
        ctype = resp.headers.get("content-type", "")
        text = html_to_text(resp.text) if "html" in ctype else resp.text
        return text[: self.s.fetch_max_chars]

    def check(self) -> str:
        self.search("test")
        return f"SearXNG OK ({self.s.searxng_url})"
