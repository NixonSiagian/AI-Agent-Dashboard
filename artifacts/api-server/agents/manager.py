from agents.base import BaseAgent
from memory.store import MemoryStore
from typing import Callable, Awaitable

EmitFn = Callable[[str, str, str], Awaitable[None]]

SYSTEM = """You are the Manager Agent in NEXUS — a multi-agent AI operating system.
Your role is to analyze incoming tasks and produce a clear, structured execution plan.

For each task:
1. Break it into concrete subtasks
2. Assign each subtask to the right specialist (Researcher, Developer, Debugger, Deployment)
3. Define expected output and success criteria
4. Consider edge cases and constraints

Output a well-structured plan in plain text. Be concise and precise."""

BACKSTORY = "Senior project manager who breaks complex requests into actionable subtasks for a team of AI specialists."


class ManagerAgent(BaseAgent):
    def __init__(self, agent_id: str, emit: EmitFn, memory: MemoryStore):
        super().__init__(
            agent_id=agent_id,
            role="Manager",
            goal="Orchestrate tasks across the agent team and produce execution plans",
            backstory=BACKSTORY,
            emit=emit,
            memory=memory,
        )

    async def plan(self, task_id: str, description: str) -> str:
        await self._emit(self.agent_id, task_id, f"[Manager] Analyzing task: {description[:80]}...")

        context = self.memory.search(description, limit=3)
        ctx_text = "\n".join(f"- {m['summary']}" for m in context) if context else "No prior context."

        user_prompt = f"""Task: {description}

Prior context from memory:
{ctx_text}

Produce a structured execution plan for the Researcher, Developer, Debugger, and Deployment agents."""

        plan = await self._think(task_id, SYSTEM, user_prompt)
        await self._emit(self.agent_id, task_id, f"[Manager] Plan ready — {len(plan.splitlines())} steps.")
        return plan
