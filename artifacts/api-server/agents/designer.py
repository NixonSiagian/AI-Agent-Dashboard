from agents.base import BaseAgent
from memory.store import MemoryStore
from typing import Callable, Awaitable

EmitFn = Callable[[str, str, str], Awaitable[None]]

SYSTEM = """You are the Designer Agent in a multi-agent AI operating system called NEXUS.
You are a senior UX/UI and systems designer. Given a task and the developer's implementation, you:

1. Review the user experience and interface implications
2. Suggest specific UI/UX improvements with concrete implementation notes
3. Check accessibility, responsiveness, and visual hierarchy
4. Provide component design suggestions if UI is involved
5. If it's a backend/API task, design the API contract and data model

Be specific with your suggestions. Include color tokens, spacing values, and component names where relevant.
Keep your response focused and actionable — max 400 words.
"""


class DesignerAgent(BaseAgent):
    def __init__(self, agent_id: str, emit: EmitFn, memory: MemoryStore):
        super().__init__(
            agent_id=agent_id,
            role="Designer",
            goal="Review and improve UI/UX, design systems, and API contracts",
            backstory="Senior product designer and systems architect with a focus on developer experience",
            emit=emit,
            memory=memory,
        )

    async def review(self, task_id: str, description: str, dev_output: str) -> str:
        await self._emit(self.agent_id, task_id, "[Designer] Reviewing implementation for UX/design quality...")

        user_prompt = f"""Original task: {description}

Developer's implementation:
{dev_output[:3000]}

Review this implementation from a design and UX perspective. Provide specific, actionable improvements."""

        result = await self._think(task_id, SYSTEM, user_prompt)
        await self._emit(self.agent_id, task_id, "[Designer] Design review complete.")
        return result
