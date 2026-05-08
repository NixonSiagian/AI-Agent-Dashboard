import asyncio
import uuid
import json
import os
from datetime import datetime
from typing import Any

import socketio

from agents.manager import ManagerAgent
from agents.developer import DeveloperAgent
from agents.designer import DesignerAgent
from agents.debugger import DebuggerAgent
from memory.store import MemoryStore


class AgentOrchestrator:
    def __init__(self, sio: socketio.AsyncServer):
        self.sio = sio
        self.memory = MemoryStore()
        self.task_history: list[dict] = []
        self._running_tasks: dict[str, asyncio.Task] = {}

        # Instantiate agents, injecting the emit callback and shared memory
        self.manager  = ManagerAgent("manager",  self._emit_log, self.memory)
        self.developer = DeveloperAgent("developer", self._emit_log, self.memory)
        self.designer  = DesignerAgent("designer",  self._emit_log, self.memory)
        self.debugger  = DebuggerAgent("debugger",  self._emit_log, self.memory)

        self._agents = [self.manager, self.developer, self.designer, self.debugger]

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
            "created_at": datetime.utcnow().isoformat(),
            "logs": [],
            "result": None,
        }
        self.task_history.append(record)

        # Fire-and-forget in a background asyncio task
        t = asyncio.create_task(self._run_pipeline(task_id, description, task_type, record))
        self._running_tasks[task_id] = t
        t.add_done_callback(lambda _: self._running_tasks.pop(task_id, None))

        await self._broadcast_task(record)
        return task_id

    # ── pipeline ──────────────────────────────────────────────────────────

    async def _run_pipeline(self, task_id: str, description: str, task_type: str, record: dict):
        await self._update_task(record, "running")

        try:
            # Step 1 – Manager plans the task
            plan = await self.manager.plan(task_id, description)
            record["logs"].append({"role": "manager", "text": plan, "ts": _ts()})

            # Step 2 – Developer writes code / solution
            dev_result = await self.developer.execute(task_id, description, plan)
            record["logs"].append({"role": "developer", "text": dev_result, "ts": _ts()})

            # Step 3 – Designer suggests UI/UX improvements if relevant
            design_result = await self.designer.review(task_id, description, dev_result)
            record["logs"].append({"role": "designer", "text": design_result, "ts": _ts()})

            # Step 4 – Debugger reviews and validates
            debug_result = await self.debugger.debug(task_id, dev_result)
            record["logs"].append({"role": "debugger", "text": debug_result, "ts": _ts()})

            # Save to memory
            self.memory.save(task_id, description, plan, dev_result, design_result, debug_result)

            record["result"] = debug_result
            await self._update_task(record, "completed")

        except Exception as exc:
            record["logs"].append({"role": "system", "text": f"Pipeline error: {exc}", "ts": _ts()})
            await self._update_task(record, "error")
            raise

    # ── socket helpers ────────────────────────────────────────────────────

    async def _emit_log(self, agent_id: str, task_id: str, message: str):
        payload = {"agent_id": agent_id, "task_id": task_id, "message": message, "ts": _ts()}
        await self.sio.emit("agent_log", payload)
        await self.sio.emit("agents_state", {"agents": self.get_agent_states()})

    async def _update_task(self, record: dict, status: str):
        record["status"] = status
        if status in ("completed", "error"):
            record["finished_at"] = _ts()
        await self._broadcast_task(record)

    async def _broadcast_task(self, record: dict):
        await self.sio.emit("task_update", {"task": record})
        await self.sio.emit("task_history", {"tasks": self.get_task_history()})


def _ts() -> str:
    return datetime.utcnow().isoformat()
