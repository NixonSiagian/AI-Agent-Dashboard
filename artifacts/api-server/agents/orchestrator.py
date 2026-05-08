import asyncio
import uuid
from datetime import datetime

import socketio

from agents.manager import ManagerAgent
from agents.researcher import ResearcherAgent
from agents.developer import DeveloperAgent
from agents.debugger import DebuggerAgent
from agents.deployment import DeploymentAgent
from memory.store import MemoryStore


class AgentOrchestrator:
    def __init__(self, sio: socketio.AsyncServer):
        self.sio = sio
        self.memory = MemoryStore()
        self.task_history: list[dict] = []
        self._running_tasks: dict[str, asyncio.Task] = {}

        self.manager    = ManagerAgent("manager",     self._emit_log, self.memory)
        self.researcher = ResearcherAgent("researcher", self._emit_log, self.memory)
        self.developer  = DeveloperAgent("developer",  self._emit_log, self.memory)
        self.debugger   = DebuggerAgent("debugger",   self._emit_log, self.memory)
        self.deployment = DeploymentAgent("deployment", self._emit_log, self.memory)

        self._agents = [
            self.manager,
            self.researcher,
            self.developer,
            self.debugger,
            self.deployment,
        ]

    # ── public helpers ────────────────────────────────────────────────────

    def get_agent_states(self) -> list[dict]:
        return [a.state() for a in self._agents]

    def get_task_history(self) -> list[dict]:
        return list(reversed(self.task_history[-50:]))

    def get_memory_entries(self) -> list[dict]:
        return self.memory.recent(30)

    # ── task submission ───────────────────────────────────────────────────

    async def submit_task(self, description: str, task_type: str = "general") -> str:
        task_id = str(uuid.uuid4())[:8]
        record = {
            "id": task_id,
            "description": description,
            "type": task_type,
            "status": "queued",
            "created_at": _ts(),
            "logs": [],
            "result": None,
            "pipeline_step": None,
            "progress": 0,
        }
        self.task_history.append(record)

        t = asyncio.create_task(self._run_pipeline(task_id, description, task_type, record))
        self._running_tasks[task_id] = t
        t.add_done_callback(lambda _: self._running_tasks.pop(task_id, None))

        await self._broadcast_task(record)
        return task_id

    # ── pipeline ──────────────────────────────────────────────────────────

    STEPS = ["manager", "researcher", "developer", "debugger", "deployment"]

    async def _run_pipeline(self, task_id: str, description: str, task_type: str, record: dict):
        await self._update_task(record, "running", pipeline_step="manager", progress=0)

        try:
            # Step 1 — Manager plans
            await self._set_step(record, "manager", 5)
            plan = await self.manager.plan(task_id, description)
            record["logs"].append({"role": "manager", "text": plan, "ts": _ts()})
            await self._broadcast_task(record)

            # Step 2 — Researcher investigates
            await self._set_step(record, "researcher", 25)
            research = await self.researcher.research(task_id, description, plan)
            record["logs"].append({"role": "researcher", "text": research, "ts": _ts()})
            await self._broadcast_task(record)

            # Step 3 — Developer implements
            await self._set_step(record, "developer", 45)
            dev_result = await self.developer.execute(task_id, description, plan, research)
            record["logs"].append({"role": "developer", "text": dev_result, "ts": _ts()})
            await self._broadcast_task(record)

            # Step 4 — Debugger validates
            await self._set_step(record, "debugger", 70)
            debug_result = await self.debugger.debug(task_id, dev_result)
            record["logs"].append({"role": "debugger", "text": debug_result, "ts": _ts()})
            await self._broadcast_task(record)

            # Step 5 — Deployment packages
            await self._set_step(record, "deployment", 88)
            deploy_result = await self.deployment.deploy(task_id, description, debug_result)
            record["logs"].append({"role": "deployment", "text": deploy_result, "ts": _ts()})
            await self._broadcast_task(record)

            # Save to memory
            self.memory.save(task_id, description, plan, dev_result, debug_result, deploy_result)
            await self.sio.emit("memory_state", {"memory": self.get_memory_entries()})

            record["result"] = debug_result
            record["pipeline_step"] = None
            await self._update_task(record, "completed", pipeline_step=None, progress=100)

        except Exception as exc:
            record["logs"].append({"role": "system", "text": f"Pipeline error: {exc}", "ts": _ts()})
            await self._update_task(record, "error", pipeline_step=None, progress=0)
            raise

    # ── socket helpers ────────────────────────────────────────────────────

    async def _set_step(self, record: dict, step: str, progress: int):
        record["pipeline_step"] = step
        record["progress"] = progress
        await self._broadcast_task(record)
        await self.sio.emit("agents_state", {"agents": self.get_agent_states()})

    async def _emit_log(self, agent_id: str, task_id: str, message: str):
        payload = {
            "agent_id": agent_id,
            "task_id": task_id,
            "message": message,
            "ts": _ts(),
        }
        await self.sio.emit("agent_log", payload)
        await self.sio.emit("agents_state", {"agents": self.get_agent_states()})

    async def _update_task(self, record: dict, status: str, pipeline_step=None, progress: int = 0):
        record["status"] = status
        if pipeline_step is not None:
            record["pipeline_step"] = pipeline_step
        record["progress"] = progress
        if status in ("completed", "error"):
            record["finished_at"] = _ts()
        await self._broadcast_task(record)

    async def _broadcast_task(self, record: dict):
        await self.sio.emit("task_update", {"task": record})
        await self.sio.emit("task_history", {"tasks": self.get_task_history()})


def _ts() -> str:
    return datetime.utcnow().isoformat()
