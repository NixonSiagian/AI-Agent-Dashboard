import asyncio
import os
import socketio
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from agents.orchestrator import AgentOrchestrator

sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*",
    logger=False,
    engineio_logger=False,
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.orchestrator = AgentOrchestrator(sio)
    yield

# Mount under /ai so the reverse proxy routes correctly
app = FastAPI(title="NEXUS AI OS", version="1.0.0", lifespan=lifespan, root_path="/ai")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── REST routes ──────────────────────────────────────────────────────────────

@app.get("/api/healthz")
async def health():
    return {"status": "ok", "version": "1.0.0"}

@app.get("/api/agents")
async def get_agents():
    orch: AgentOrchestrator = app.state.orchestrator
    return {"agents": orch.get_agent_states()}

@app.get("/api/tasks")
async def get_tasks():
    orch: AgentOrchestrator = app.state.orchestrator
    return {"tasks": orch.get_task_history()}

@app.post("/api/tasks")
async def submit_task(body: dict):
    orch: AgentOrchestrator = app.state.orchestrator
    task_id = await orch.submit_task(body.get("description", ""), body.get("type", "general"))
    return {"task_id": task_id, "status": "queued"}

@app.get("/api/memory")
async def get_memory():
    orch: AgentOrchestrator = app.state.orchestrator
    return {"memory": orch.get_memory_entries()}

# ── Socket.IO events ─────────────────────────────────────────────────────────

@sio.event
async def connect(sid, environ):
    orch: AgentOrchestrator = app.state.orchestrator
    await sio.emit("agents_state", {"agents": orch.get_agent_states()}, to=sid)
    await sio.emit("task_history", {"tasks": orch.get_task_history()}, to=sid)
    await sio.emit("memory_state", {"memory": orch.get_memory_entries()}, to=sid)

@sio.event
async def disconnect(sid):
    pass

@sio.event
async def submit_task(sid, data):
    orch: AgentOrchestrator = app.state.orchestrator
    task_id = await orch.submit_task(
        data.get("description", ""),
        data.get("type", "general"),
    )
    await sio.emit("task_queued", {"task_id": task_id}, to=sid)

# ── Mount Socket.IO under /ai/socket.io ──────────────────────────────────────

socket_app = socketio.ASGIApp(sio, other_asgi_app=app, socketio_path="/ai/socket.io")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(socket_app, host="0.0.0.0", port=port, log_level="info")
