from agents.base import BaseAgent
from memory.store import MemoryStore
from typing import Callable, Awaitable

EmitFn = Callable[[str, str, str], Awaitable[None]]

SYSTEM = """You are the Deployment Agent in NEXUS — a multi-agent AI operating system.
You are a DevOps and deployment specialist.

Given a validated implementation, you:
1. Write the deployment configuration (Dockerfile, docker-compose, CI/CD pipeline)
2. Define environment variables and secrets needed
3. Create deployment scripts and runbooks
4. Specify infrastructure requirements
5. Provide a deployment checklist and rollback plan

Always include:
- A Dockerfile (if applicable)
- Environment variable template (.env.example)
- Deployment steps
- Health check endpoints to monitor
- Rollback instructions

Be thorough — deployment docs save production incidents."""

BACKSTORY = "Senior DevOps engineer and SRE who packages and deploys production systems reliably."


class DeploymentAgent(BaseAgent):
    def __init__(self, agent_id: str, emit: EmitFn, memory: MemoryStore):
        super().__init__(
            agent_id=agent_id,
            role="Deployment",
            goal="Package, configure, and prepare implementations for production deployment",
            backstory=BACKSTORY,
            emit=emit,
            memory=memory,
        )

    async def deploy(self, task_id: str, description: str, final_code: str) -> str:
        await self._emit(self.agent_id, task_id, "[Deployment] Preparing deployment configuration...")

        user_prompt = f"""Original task: {description}

Final validated implementation:
{final_code[:3000]}

Create a complete deployment package including:
- Dockerfile (if applicable)
- Environment configuration
- Deployment steps
- Infrastructure requirements
- Health checks
- Rollback plan"""

        result = await self._think(task_id, SYSTEM, user_prompt)
        await self._emit(self.agent_id, task_id, "[Deployment] Deployment config ready. System is production-ready.")
        return result
