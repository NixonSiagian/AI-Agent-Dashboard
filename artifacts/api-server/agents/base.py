import asyncio
import os
from typing import Callable, Awaitable

from google import genai
from google.genai import types
from memory.store import MemoryStore

EmitFn = Callable[[str, str, str], Awaitable[None]]

_client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY", ""))
_MODEL  = "gemini-2.0-flash"


class BaseAgent:
    def __init__(
        self,
        agent_id: str,
        role: str,
        goal: str,
        backstory: str,
        emit: EmitFn,
        memory: MemoryStore,
    ):
        self.agent_id = agent_id
        self.role     = role
        self.goal     = goal
        self.backstory = backstory
        self._emit    = emit
        self.memory   = memory
        self._status       = "idle"
        self._current_task: str | None = None
        self._tasks_done   = 0
        self._progress     = 0

    def state(self) -> dict:
        return {
            "id":           self.agent_id,
            "role":         self.role,
            "goal":         self.goal,
            "status":       self._status,
            "current_task": self._current_task,
            "tasks_done":   self._tasks_done,
            "progress":     self._progress,
        }

    async def _think(self, task_id: str, system: str, user: str) -> str:
        self._status       = "working"
        self._current_task = task_id
        self._progress     = 0
        await self._emit(self.agent_id, task_id, f"[{self.role}] Initializing...")

        self._progress = 15
        await self._emit(self.agent_id, task_id, f"[{self.role}] Sending to Gemini 2.0 Flash...")

        try:
            response = await asyncio.to_thread(
                _client.models.generate_content,
                model=_MODEL,
                contents=user,
                config=types.GenerateContentConfig(
                    system_instruction=system,
                    temperature=0.7,
                    max_output_tokens=2048,
                ),
            )
            result = response.text or ""
        except Exception as e:
            result = f"[ERROR] Gemini API error: {e}"
            await self._emit(self.agent_id, task_id, f"[{self.role}] Error: {e}")

        self._progress = 90
        await self._emit(self.agent_id, task_id, f"[{self.role}] Finalizing output...")

        self._status       = "idle"
        self._current_task = None
        self._tasks_done  += 1
        self._progress     = 100
        await self._emit(self.agent_id, task_id, f"[{self.role}] Complete — {len(result)} chars.")
        self._progress = 0
        return result
