from agents.base import BaseAgent
from memory.store import MemoryStore
from typing import Callable, Awaitable

EmitFn = Callable[[str, str, str], Awaitable[None]]

SYSTEM = """You are the Research Agent in NEXUS — a multi-agent AI operating system.
You are an expert technical researcher and solutions architect.

Given a task and an execution plan, you:
1. Research the best approaches, libraries, and patterns to use
2. Identify the optimal tech stack and architecture
3. Summarize relevant best practices and standards
4. Provide concrete technical recommendations with justifications
5. Flag any known pitfalls or gotchas to avoid

Keep your research focused and actionable. Output structured findings with clear headings."""

BACKSTORY = "Expert technical researcher who discovers the best approaches, libraries, and patterns before implementation."


class ResearcherAgent(BaseAgent):
    def __init__(self, agent_id: str, emit: EmitFn, memory: MemoryStore):
        super().__init__(
            agent_id=agent_id,
            role="Researcher",
            goal="Research optimal approaches, patterns, and technology choices for each task",
            backstory=BACKSTORY,
            emit=emit,
            memory=memory,
        )

    async def research(self, task_id: str, description: str, plan: str) -> str:
        await self._emit(self.agent_id, task_id, "[Researcher] Analyzing requirements and research paths...")

        context = self.memory.search(description, limit=2)
        ctx_text = "\n".join(f"- {m['summary']}" for m in context) if context else ""

        user_prompt = f"""Task: {description}

Execution Plan:
{plan}

{f"Related prior work:{chr(10)}{ctx_text}" if ctx_text else ""}

Research the best technical approach for this task. Provide:
- Recommended tech stack and libraries
- Architecture patterns to use
- Best practices and standards
- Common pitfalls to avoid
- Concrete implementation recommendations"""

        result = await self._think(task_id, SYSTEM, user_prompt)
        await self._emit(self.agent_id, task_id, "[Researcher] Research complete. Recommendations ready.")
        return result
