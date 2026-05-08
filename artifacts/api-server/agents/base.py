import asyncio
from datetime import datetime
from typing import Callable, Awaitable

from openai import AsyncOpenAI
from memory.store import MemoryStore

EmitFn = Callable[[str, str, str], Awaitable[None]]


class BaseAgent:
    def __init__(
        self,
        agent_id: str,
        role: str,
        goal: str,
        backstory: str,
        emit: EmitFn,
        memory: MemoryStore,
        model: str = "gpt-4o",
    ):
        self.agent_id = agent_id
        self.role = role
        self.goal = goal
        self.backstory = backstory
        self._emit = emit
        self.memory = memory
        self.model = model
        self.client = AsyncOpenAI()
        self._status = "idle"
        self._current_task: str | None = None
        self._tasks_done: int = 0

    def state(self) -> dict:
        return {
            "id": self.agent_id,
            "role": self.role,
            "goal": self.goal,
            "status": self._status,
            "current_task": self._current_task,
            "tasks_done": self._tasks_done,
        }

    async def _think(self, task_id: str, system: str, user: str) -> str:
        self._status = "working"
        self._current_task = task_id
        await self._emit(self.agent_id, task_id, f"[{self.role}] thinking...")

        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system},
                {"role": "user",   "content": user},
            ],
            temperature=0.7,
        )
        result = response.choices[0].message.content or ""

        self._status = "idle"
        self._current_task = None
        self._tasks_done += 1
        await self._emit(self.agent_id, task_id, f"[{self.role}] done.")
        return result
