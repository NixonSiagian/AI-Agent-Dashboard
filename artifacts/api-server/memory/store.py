import json
import os
from datetime import datetime
from typing import Optional

MEMORY_FILE = os.path.join(os.path.dirname(__file__), "memory.json")


class MemoryStore:
    """Simple persistent JSON-backed memory store for agent context."""

    def __init__(self):
        self._entries: list[dict] = []
        self._load()

    def _load(self):
        if os.path.exists(MEMORY_FILE):
            try:
                with open(MEMORY_FILE, "r") as f:
                    self._entries = json.load(f)
            except Exception:
                self._entries = []

    def _persist(self):
        os.makedirs(os.path.dirname(MEMORY_FILE), exist_ok=True)
        with open(MEMORY_FILE, "w") as f:
            json.dump(self._entries[-200:], f, indent=2)

    def save(
        self,
        task_id: str,
        description: str,
        plan: str,
        dev_result: str,
        design_result: str,
        debug_result: str,
    ):
        entry = {
            "id": task_id,
            "timestamp": datetime.utcnow().isoformat(),
            "description": description,
            "summary": description[:120],
            "plan": plan[:500],
            "dev_result": dev_result[:800],
            "design_result": design_result[:400],
            "debug_result": debug_result[:400],
        }
        self._entries.append(entry)
        self._persist()

    def search(self, query: str, limit: int = 5) -> list[dict]:
        """Naive keyword search across memory entries."""
        query_lower = query.lower()
        scored = []
        for entry in self._entries:
            text = (entry.get("description", "") + " " + entry.get("summary", "")).lower()
            score = sum(1 for word in query_lower.split() if word in text)
            if score > 0:
                scored.append((score, entry))
        scored.sort(key=lambda x: x[0], reverse=True)
        return [e for _, e in scored[:limit]]

    def recent(self, limit: int = 20) -> list[dict]:
        return list(reversed(self._entries[-limit:]))

    def all(self) -> list[dict]:
        return self._entries
