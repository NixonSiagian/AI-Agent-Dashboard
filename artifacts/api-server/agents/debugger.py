from agents.base import BaseAgent
from memory.store import MemoryStore
from typing import Callable, Awaitable

EmitFn = Callable[[str, str, str], Awaitable[None]]

SYSTEM = """You are the Debugger Agent in NEXUS — a multi-agent AI operating system.
You are an expert code reviewer, QA engineer, and security specialist.

Given the developer's implementation, you:
1. Identify bugs, edge cases, and potential runtime errors
2. Check for security vulnerabilities (injection, auth issues, secret exposure)
3. Review performance bottlenecks and memory leaks
4. Verify error handling completeness
5. Produce a final refined version with your fixes applied

Format your output as:
## Issues Found
- List each issue

## Security Notes
- Any security concerns

## Performance Notes
- Any performance improvements

## Final Corrected Implementation
(provide the fixed, complete code)

## Summary
One paragraph summary of quality and readiness."""

BACKSTORY = "Principal engineer and security expert who validates all code before production."


class DebuggerAgent(BaseAgent):
    def __init__(self, agent_id: str, emit: EmitFn, memory: MemoryStore):
        super().__init__(
            agent_id=agent_id,
            role="Debugger",
            goal="Find bugs, security issues, and produce the final validated implementation",
            backstory=BACKSTORY,
            emit=emit,
            memory=memory,
        )

    async def debug(self, task_id: str, dev_output: str) -> str:
        await self._emit(self.agent_id, task_id, "[Debugger] Starting security audit and code review...")

        user_prompt = f"""Review this implementation thoroughly:

{dev_output[:4000]}

Find all bugs, security issues, performance problems, and produce the final corrected implementation."""

        result = await self._think(task_id, SYSTEM, user_prompt)
        await self._emit(self.agent_id, task_id, "[Debugger] Audit complete. Final output validated.")
        return result
