import asyncio
import os
import random
from typing import Callable, Awaitable

from google import genai
from google.genai import types
from memory.store import MemoryStore

EmitFn = Callable[[str, str, str], Awaitable[None]]

_client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY", ""))
_MODEL  = "gemini-1.5-flash"   # free-tier friendly

# Global API health state
api_status = {"ok": True, "failures": 0, "cooldown_until": 0.0}

# ── Simulation fallbacks per agent role ─────────────────────────────────
_SIM_RESPONSES: dict[str, list[str]] = {
    "Manager": [
        "SIMULATION MODE\n\n## Execution Plan\n1. Research phase — gather requirements and best practices\n2. Development phase — implement core functionality\n3. Debug phase — validate correctness and security\n4. Deploy phase — containerise and ship\n\nEstimated complexity: Medium. Recommending iterative delivery.",
        "SIMULATION MODE\n\n## Task Breakdown\n- Subtask A: Architecture design\n- Subtask B: Core implementation\n- Subtask C: Integration testing\n- Subtask D: Deployment package\n\nAssigning to specialist agents now.",
    ],
    "Researcher": [
        "SIMULATION MODE\n\n## Research Findings\n- Recommended pattern: Clean Architecture with SOLID principles\n- Libraries: FastAPI, Pydantic v2, SQLAlchemy 2.0\n- Testing: pytest with httpx async client\n- CI/CD: GitHub Actions → Docker → Cloud Run\n\nNo known blockers identified.",
        "SIMULATION MODE\n\n## Technical Recommendations\n- Use async/await throughout for I/O-bound tasks\n- Apply repository pattern for data access\n- JWT for auth, bcrypt for passwords\n- Rate limiting at API gateway level",
    ],
    "Developer": [
        'SIMULATION MODE\n\n## Implementation\n\nHere is the core implementation:\n\n```python\nfrom fastapi import FastAPI, HTTPException\nfrom pydantic import BaseModel\nfrom typing import Optional\nimport asyncio\n\napp = FastAPI(title="Generated API")\n\nclass Item(BaseModel):\n    name: str\n    value: Optional[str] = None\n\n@app.get("/health")\nasync def health():\n    return {"status": "ok"}\n\n@app.post("/items")\nasync def create_item(item: Item):\n    return {"id": "abc123", "item": item}\n```\n\nFull error handling and validation included.',
        'SIMULATION MODE\n\n## Implementation\n\n```typescript\nimport express from "express";\nconst app = express();\n\napp.use(express.json());\n\napp.get("/api/health", (_, res) => res.json({ ok: true }));\n\napp.post("/api/data", async (req, res) => {\n  try {\n    const { payload } = req.body;\n    if (!payload) throw new Error("Missing payload");\n    res.json({ success: true, echo: payload });\n  } catch (err) {\n    res.status(400).json({ error: String(err) });\n  }\n});\n\napp.listen(3000);\n```',
    ],
    "Debugger": [
        "SIMULATION MODE\n\n## Issues Found\n- Line 12: potential null reference — add optional chaining\n- Line 34: missing input validation on user-supplied strings\n- Line 67: unhandled promise rejection in async block\n\n## Security Notes\n- No secrets exposed\n- SQL injection not applicable (ORM used)\n\n## Final Corrected Implementation\n(see above with fixes applied)\n\n## Summary\nCode quality: Good. Three minor issues fixed. Ready for production with noted changes.",
        "SIMULATION MODE\n\n## Issues Found\n- Missing error boundary around async calls\n- `any` type used in TypeScript — replace with proper types\n\n## Security Notes\n- CORS policy should be tightened in production\n\n## Summary\nOverall solid implementation. Two minor issues patched. Production-ready after review.",
    ],
    "Deployment": [
        "SIMULATION MODE\n\n## Deployment Package\n\n```dockerfile\nFROM python:3.11-slim\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install -r requirements.txt\nCOPY . .\nEXPOSE 8080\nCMD [\"uvicorn\", \"main:app\", \"--host\", \"0.0.0.0\", \"--port\", \"8080\"]\n```\n\n## Checklist\n- [x] Dockerfile created\n- [x] Health endpoint verified\n- [x] Env vars documented\n- [x] Rollback plan: redeploy previous image tag",
        "SIMULATION MODE\n\n## CI/CD Pipeline\n\n```yaml\nname: Deploy\non: [push]\njobs:\n  deploy:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - name: Build\n        run: docker build -t app:latest .\n      - name: Deploy\n        run: docker push registry/app:latest\n```\n\nRollback: `docker pull registry/app:previous && docker run -p 8080:8080 registry/app:previous`",
    ],
}


def _sim_response(role: str) -> str:
    options = _SIM_RESPONSES.get(role, ["SIMULATION MODE\n\nTask processed successfully."])
    return random.choice(options)


class BaseAgent:
    def __init__(
        self,
        agent_id: str,
        role: str,
        goal: str,
        backstory: str,
        emit: EmitFn,
        memory: MemoryStore,
    ):
        self.agent_id  = agent_id
        self.role      = role
        self.goal      = goal
        self.backstory = backstory
        self._emit     = emit
        self.memory    = memory
        self._status       = "idle"
        self._current_task: str | None = None
        self._tasks_done   = 0
        self._progress     = 0

    def state(self) -> dict:
        return {
            "id":           self.agent_id,
            "role":         self.role,
            "goal":         self.goal,
            "status":       self._status,
            "current_task": self._current_task,
            "tasks_done":   self._tasks_done,
            "progress":     self._progress,
        }

    async def _think(self, task_id: str, system: str, user: str) -> str:
        self._status       = "working"
        self._current_task = task_id
        self._progress     = 0
        await self._emit(self.agent_id, task_id, f"[{self.role}] Starting...")

        result = await self._call_gemini_with_fallback(task_id, system, user)

        self._progress = 90
        await self._emit(self.agent_id, task_id, f"[{self.role}] Finalizing output...")

        self._status       = "idle"
        self._current_task = None
        self._tasks_done  += 1
        self._progress     = 100
        is_sim = result.startswith("SIMULATION MODE")
        await self._emit(
            self.agent_id, task_id,
            f"[{self.role}] {'[SIM] ' if is_sim else ''}Complete — {len(result)} chars."
        )
        self._progress = 0
        return result

    async def _call_gemini_with_fallback(self, task_id: str, system: str, user: str) -> str:
        import time

        # If in cooldown, skip straight to simulation
        if time.time() < api_status["cooldown_until"]:
            remaining = int(api_status["cooldown_until"] - time.time())
            await self._emit(self.agent_id, task_id,
                f"[{self.role}] [API COOLDOWN] {remaining}s remaining — running simulation mode...")
            return await self._simulated_run(task_id)

        # Try Gemini with up to 2 retries
        last_err = None
        for attempt in range(2):
            try:
                self._progress = 20 + attempt * 15
                await self._emit(self.agent_id, task_id,
                    f"[{self.role}] Calling Gemini 1.5 Flash (attempt {attempt+1})...")

                response = await asyncio.to_thread(
                    _client.models.generate_content,
                    model=_MODEL,
                    contents=user,
                    config=types.GenerateContentConfig(
                        system_instruction=system,
                        temperature=0.7,
                        max_output_tokens=2048,
                    ),
                )
                result = response.text or ""
                # Success — reset failure counter
                api_status["ok"] = True
                api_status["failures"] = 0
                await self._emit(self.agent_id, task_id, f"[{self.role}] Gemini responded OK.")
                return result

            except Exception as e:
                last_err = e
                err_str = str(e)
                api_status["failures"] += 1

                if "429" in err_str or "RESOURCE_EXHAUSTED" in err_str or "quota" in err_str.lower():
                    # Quota hit — enter cooldown and fall back immediately
                    import time as _t
                    cooldown = min(60 * (2 ** api_status["failures"]), 300)
                    api_status["ok"] = False
                    api_status["cooldown_until"] = _t.time() + cooldown
                    await self._emit(self.agent_id, task_id,
                        f"[{self.role}] [QUOTA EXCEEDED] Gemini 429 — cooldown {cooldown}s, switching to simulation mode.")
                    return await self._simulated_run(task_id)

                # Other error — wait 2s and retry
                await self._emit(self.agent_id, task_id,
                    f"[{self.role}] [WARN] API error (attempt {attempt+1}): {err_str[:80]} — retrying...")
                await asyncio.sleep(2)

        # All retries exhausted
        await self._emit(self.agent_id, task_id,
            f"[{self.role}] [FALLBACK] All retries failed — running simulation mode.")
        return await self._simulated_run(task_id)

    async def _simulated_run(self, task_id: str) -> str:
        """Realistic-feeling simulated response with progress updates."""
        self._progress = 30
        await self._emit(self.agent_id, task_id, f"[{self.role}] [SIM] Initializing simulation engine...")
        await asyncio.sleep(0.6)

        self._progress = 55
        await self._emit(self.agent_id, task_id, f"[{self.role}] [SIM] Processing task locally...")
        await asyncio.sleep(0.8)

        self._progress = 80
        await self._emit(self.agent_id, task_id, f"[{self.role}] [SIM] Generating output...")
        await asyncio.sleep(0.5)

        return _sim_response(self.role)
