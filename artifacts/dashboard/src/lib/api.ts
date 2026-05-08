const BASE = "/ai";

export async function fetchAgents() {
  const r = await fetch(`${BASE}/api/agents`);
  if (!r.ok) throw new Error("Failed to fetch agents");
  return r.json();
}

export async function fetchTasks() {
  const r = await fetch(`${BASE}/api/tasks`);
  if (!r.ok) throw new Error("Failed to fetch tasks");
  return r.json();
}

export async function fetchMemory() {
  const r = await fetch(`${BASE}/api/memory`);
  if (!r.ok) throw new Error("Failed to fetch memory");
  return r.json();
}

export async function submitTask(description: string, type = "general") {
  const r = await fetch(`${BASE}/api/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ description, type }),
  });
  if (!r.ok) throw new Error("Failed to submit task");
  return r.json();
}

export async function healthCheck() {
  try {
    const r = await fetch(`${BASE}/api/healthz`);
    return r.ok;
  } catch {
    return false;
  }
}
