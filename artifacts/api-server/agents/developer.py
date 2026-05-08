from agents.base import BaseAgent
from memory.store import MemoryStore
from typing import Callable, Awaitable

EmitFn = Callable[[str, str, str], Awaitable[None]]

SYSTEM = """You are the Developer Agent in NEXUS — a multi-agent AI operating system.
You are an expert full-stack engineer.

Given a task, execution plan, and research findings, you:
1. Write clean, production-ready code
2. Choose the right technology stack based on the research
3. Include comprehensive error handling
4. Add inline comments explaining key decisions
5. Produce working, complete code — not pseudocode or placeholders

Format: Output code with proper markdown code blocks and language tags.
Always include a brief explanation before the code of what you built and why."""

BACKSTORY = "Senior full-stack engineer with expertise across Python, TypeScript, React, Node.js, and system design."


class DeveloperAgent(BaseAgent):
    def __init__(self, agent_id: str, emit: EmitFn, memory: MemoryStore):
        super().__init__(
            agent_id=agent_id,
            role="Developer",
            goal="Write high-quality, production-ready code to implement the task",
            backstory=BACKSTORY,
            emit=emit,
            memory=memory,
        )

    async def execute(self, task_id: str, description: str, plan: str, research: str = "") -> str:
        await self._emit(self.agent_id, task_id, "[Developer] Starting implementation...")

        context = self.memory.search(description, limit=2)
        ctx_text = "\n".join(f"- {m['summary']}" for m in context) if context else ""

        user_prompt = f"""Task: {description}

Execution Plan:
{plan}

{f"Research Findings:{chr(10)}{research[:1500]}" if research else ""}

{f"Relevant prior work:{chr(10)}{ctx_text}" if ctx_text else ""}

Implement this task with production-ready code. Include full implementation, error handling, and comments."""

        result = await self._think(task_id, SYSTEM, user_prompt)
        await self._emit(self.agent_id, task_id, f"[Developer] Implementation complete — {len(result)} chars.")
        return result
