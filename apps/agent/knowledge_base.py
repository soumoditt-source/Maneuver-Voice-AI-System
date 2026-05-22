"""
Knowledge base loader and search for Maneuver agency information.
Reads from ../../data/maneuver.md relative to this file's location.
"""
from __future__ import annotations

import os
import re
import logging
from pathlib import Path
from functools import lru_cache
from typing import Optional

logger = logging.getLogger(__name__)

# Resolve the path to maneuver.md relative to this file
_THIS_DIR = Path(__file__).parent.resolve()
_KB_PATH = _THIS_DIR / ".." / ".." / "data" / "maneuver.md"

# Fallback knowledge base content if file is not found
_FALLBACK_KB = """# Maneuver Agency Knowledge Base

## About Maneuver
Maneuver is a digital strategy and product agency founded by Alex Chen. We help ambitious founders and companies build, launch, and scale digital products. Our focus is on combining sharp strategy with world-class execution.

## Services

### Product Strategy
We help companies define what to build, why to build it, and how to prioritize. This includes market research, user interviews, competitive analysis, roadmap planning, and product-market fit validation.

### UX/UI Design
End-to-end design from wireframes to high-fidelity prototypes. We design products people actually love using. Our design process is deeply research-driven and iterative.

### Web & Mobile Development
Full-stack development for web and mobile products. We work in React, Next.js, React Native, Node.js, Python, and more. We build fast, scalable, and maintainable codebases.

### Growth & Digital Marketing
Data-driven growth strategies including SEO, paid acquisition, content marketing, email automation, and conversion rate optimization.

### AI Integration
We help companies integrate AI capabilities into their products — from chatbots and recommendation engines to custom ML models and voice AI systems.

### Brand & Communications
Brand identity, messaging architecture, positioning strategy, and content strategy for startups and scaling companies.

## Our Process

### Phase 1: Discovery (1-2 weeks)
Deep-dive into your business, users, and market. We run stakeholder interviews, competitive audits, and user research to build a shared foundation of truth.

### Phase 2: Strategy (1-2 weeks)
Define the solution architecture, product roadmap, go-to-market strategy, and success metrics. Deliverables include a strategy deck and detailed project specification.

### Phase 3: Design (2-6 weeks)
Iterative design sprints from low-fidelity wireframes to polished, developer-ready designs. Regular client reviews built in.

### Phase 4: Build (4-16 weeks)
Agile development sprints with weekly demos. Full QA and testing. We ship working software.

### Phase 5: Launch & Grow
Support through launch, performance monitoring, and growth optimization. We don't disappear after go-live.

## Why Maneuver

- **Speed**: We move fast without breaking things
- **Founder-Led**: Alex and the leadership team are actively involved in every engagement
- **Full-Stack**: Strategy through execution — no handoff gaps
- **Honest**: We tell you if we're not the right fit
- **Results-Focused**: We care about outcomes, not just deliverables

## Typical Clients

- Early-stage startups (Seed to Series A) building their first or second product
- Scaleups looking to modernize or extend their product suite
- Enterprises launching innovation initiatives
- Founders who've tried building in-house and need expert reinforcement

## Engagement Models

### Project-Based
Fixed scope, fixed price. Best for well-defined projects with clear deliverables.

### Retainer
Ongoing monthly partnership. Best for companies that need continuous design/dev capacity.

### Sprint Model
Intensive 2-4 week focused sprints. Best for companies that need to move fast on a specific problem.

## Pricing
Project engagements typically range from $15,000 to $250,000+ depending on scope. Retainers start at $8,000/month. We're flexible and can work within budgets if the fit is right.

## Contact
Email: hello@maneuver.agency
Website: https://maneuver.agency
"""


@lru_cache(maxsize=1)
def load_kb() -> str:
    """Load the full knowledge base text from maneuver.md."""
    kb_path = _KB_PATH.resolve()
    if kb_path.exists():
        try:
            text = kb_path.read_text(encoding="utf-8")
            logger.info(f"Knowledge base loaded from {kb_path} ({len(text)} chars)")
            return text
        except Exception as e:
            logger.warning(f"Failed to read KB from {kb_path}: {e}. Using fallback.")
            return _FALLBACK_KB
    else:
        logger.warning(f"KB file not found at {kb_path}. Using fallback knowledge base.")
        return _FALLBACK_KB


def _get_sections(kb_text: str) -> list[dict]:
    """Parse markdown into a list of {header, level, content} dicts."""
    sections = []
    current_header = "Introduction"
    current_level = 1
    current_lines: list[str] = []

    for line in kb_text.splitlines():
        header_match = re.match(r"^(#{1,6})\s+(.+)$", line)
        if header_match:
            if current_lines:
                sections.append({
                    "header": current_header,
                    "level": current_level,
                    "content": "\n".join(current_lines).strip(),
                })
            current_level = len(header_match.group(1))
            current_header = header_match.group(2).strip()
            current_lines = []
        else:
            current_lines.append(line)

    # flush the last section
    if current_lines:
        sections.append({
            "header": current_header,
            "level": current_level,
            "content": "\n".join(current_lines).strip(),
        })

    return sections


def search_kb(query: str, max_sections: int = 3) -> str:
    """
    Search the knowledge base for sections relevant to the query.
    Uses keyword matching against section headers and content.
    Returns up to max_sections of the most relevant content.
    """
    kb_text = load_kb()
    sections = _get_sections(kb_text)

    query_lower = query.lower()
    query_words = set(re.findall(r"\b\w{3,}\b", query_lower))

    def score(section: dict) -> int:
        header_lower = section["header"].lower()
        content_lower = section["content"].lower()
        combined = header_lower + " " + content_lower
        s = 0
        for word in query_words:
            if word in header_lower:
                s += 5  # header match worth more
            if word in content_lower:
                s += combined.count(word)
        return s

    scored = sorted(sections, key=score, reverse=True)
    top = [s for s in scored[:max_sections] if score(s) > 0]

    if not top:
        # Return introduction / top-level sections as fallback
        top = [s for s in sections if s["level"] <= 2][:max_sections]

    result_parts = []
    for s in top:
        header_prefix = "#" * s["level"]
        result_parts.append(f"{header_prefix} {s['header']}\n{s['content']}")

    return "\n\n---\n\n".join(result_parts) if result_parts else kb_text[:2000]


def get_service_names() -> list[str]:
    """Return the list of service names from the knowledge base."""
    kb_text = load_kb()
    sections = _get_sections(kb_text)

    service_names = []
    in_services = False

    for section in sections:
        header_lower = section["header"].lower()
        if "service" in header_lower and section["level"] <= 2:
            in_services = True
            continue
        if in_services:
            if section["level"] <= 2 and "service" not in header_lower:
                in_services = False
            elif section["level"] >= 3:
                service_names.append(section["header"])

    # Fallback to hardcoded list if parsing fails
    if not service_names:
        service_names = [
            "Product Strategy",
            "UX/UI Design",
            "Web & Mobile Development",
            "Growth & Digital Marketing",
            "AI Integration",
            "Brand & Communications",
        ]

    return service_names


def get_services_overview() -> str:
    """Return the full services section from the knowledge base."""
    kb_text = load_kb()
    sections = _get_sections(kb_text)

    services_content = []
    in_services = False

    for section in sections:
        header_lower = section["header"].lower()
        if "service" in header_lower and section["level"] <= 2:
            in_services = True
            services_content.append(f"## {section['header']}\n{section['content']}")
            continue
        if in_services:
            if section["level"] <= 2 and "service" not in header_lower:
                break
            services_content.append(f"{'#' * section['level']} {section['header']}\n{section['content']}")

    if services_content:
        return "\n\n".join(services_content)

    # Fallback search
    return search_kb("services what we do offer", max_sections=4)


def get_section_by_name(name: str) -> Optional[str]:
    """Return a specific section by exact or fuzzy header name match."""
    kb_text = load_kb()
    sections = _get_sections(kb_text)
    name_lower = name.lower()

    # Exact match first
    for s in sections:
        if s["header"].lower() == name_lower:
            return f"{'#' * s['level']} {s['header']}\n{s['content']}"

    # Partial match
    for s in sections:
        if name_lower in s["header"].lower() or s["header"].lower() in name_lower:
            return f"{'#' * s['level']} {s['header']}\n{s['content']}"

    return None
