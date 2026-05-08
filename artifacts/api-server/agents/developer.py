from agents.base import BaseAgent
from memory.store import MemoryStore
from typing import Callable, Awaitable

EmitFn = Callable[[str, str, str], Awaitable[None]]

SYSTEM = """You are the Developer Agent in a multi-agent AI operating system called NEXUS.
You are an expert full-stack engineer. Given a task description and an execution plan, you:

1. Write clean, production-ready code
2. Choose the right technology stack
3. Include error handling
4. Add inline comments explaining key decisions
5. Produce working code, not pseudocode

Format: output the code with proper markdown code blocks with language tags.
Always include a brief explanation before the code of what you built and why.
"""


class DeveloperAgent(BaseAgent):
    def __init__(self, agent_id: str, emit: EmitFn, memory: MemoryStore):
        super().__init__(
            agent_id=agent_id,
            role="Developer",
            goal="Write high-quality, production-ready code to implement the task",
            backstory="Senior full-stack engineer with expertise across Python, TypeScript, React, and system design",
            emit=emit,
            memory=memory,
        )

    async def execute(self, task_id: str, description: str, plan: str) -> str:
        await self._emit(self.agent_id, task_id, "[Developer] Starting implementation...")

        # Pull relevant code examples from memory
        context = self.memory.search(description, limit=2)
        ctx_text = "\n".join(f"- {m['summary']}" for m in context) if context else ""

        user_prompt = f"""Task: {description}

Execution Plan:
{plan}

{f"Relevant prior work:{chr(10)}{ctx_text}" if ctx_text else ""}

Implement this task. Write production-ready code with full implementation."""

        result = await self._think(task_id, SYSTEM, user_prompt)
        await self._emit(self.agent_id, task_id, f"[Developer] Implementation complete ({len(result)} chars).")
        return result
