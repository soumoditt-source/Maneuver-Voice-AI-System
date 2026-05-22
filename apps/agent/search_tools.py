import asyncio
import httpx
from bs4 import BeautifulSoup
from duckduckgo_search import AsyncDDGS
import logging

logger = logging.getLogger(__name__)

async def web_search(query: str, max_results: int = 5) -> list[dict]:
    """Search DuckDuckGo and return a list of results."""
    try:
        results = []
        async with AsyncDDGS() as ddgs:
            async for r in ddgs.text(query, max_results=max_results):
                results.append({
                    "title": r.get("title"),
                    "link": r.get("href"),
                    "snippet": r.get("body")
                })
        return results
    except Exception as e:
        logger.error(f"Search failed for query '{query}': {e}")
        return []

async def fetch_page(url: str, max_chars: int = 2000) -> str:
    """Fetch a web page and return its text content."""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url, follow_redirects=True)
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, "html.parser")
            # remove scripts and styles
            for script in soup(["script", "style"]):
                script.decompose()
            text = soup.get_text(separator=" ", strip=True)
            return text[:max_chars]
    except Exception as e:
        logger.error(f"Failed to fetch {url}: {e}")
        return f"Could not fetch content from {url}"
