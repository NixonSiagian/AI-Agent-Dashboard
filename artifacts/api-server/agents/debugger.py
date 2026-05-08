from agents.base import BaseAgent
from memory.store import MemoryStore
from typing import Callable, Awaitable

EmitFn = Callable[[str, str, str], Awaitable[None]]

SYSTEM = """You are the Debugger Agent in a multi-agent AI operating system called NEXUS.
You are an expert code reviewer and QA engineer. Given the developer's implementation, you:

1. Identify bugs, edge cases, and potential runtime errors
2. Check for security vulnerabilities (injection, auth issues, secrets exposure)
3. Review performance bottlenecks
4. Verify error handling completeness
5. Produce a final refined version of the code with your fixes applied

Format your output as:
## Issues Found
- List each issue clearly

## Security Notes
- Any security concerns

## Final Corrected Implementation
(provide the fixed code)

## Summary
One paragraph summary of what was built and its quality.
"""


class DebuggerAgent(BaseAgent):
    def __init__(self, agent_id: str, emit: EmitFn, memory: MemoryStore):
        super().__init__(
            agent_id=agent_id,
            role="Debugger",
            goal="Find bugs, security issues, and produce the final validated implementation",
            backstory="Principal engineer and security expert who validates all code before production",
            emit=emit,
            memory=memory,
        )

    async def debug(self, task_id: str, dev_output: str) -> str:
        await self._emit(self.agent_id, task_id, "[Debugger] Starting code review and security audit...")

        user_prompt = f"""Review this implementation thoroughly:

{dev_output[:4000]}

Find all bugs, security issues, and produce the final corrected implementation."""

        result = await self._think(task_id, SYSTEM, user_prompt)
        await self._emit(self.agent_id, task_id, "[Debugger] Audit complete. Final output ready.")
        return result
