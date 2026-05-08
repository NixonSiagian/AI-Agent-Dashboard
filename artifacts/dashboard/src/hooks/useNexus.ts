import { useEffect, useRef, useState, useCallback } from "react";
import { getSocket } from "@/lib/socket";
import { submitTask as apiSubmitTask, healthCheck } from "@/lib/api";

export interface AgentState {
  id: string;
  role: string;
  goal: string;
  status: "idle" | "working" | "error";
  current_task: string | null;
  tasks_done: number;
  progress: number;
}

export interface LogEntry {
  agent_id: string;
  task_id: string;
  message: string;
  ts: string;
}

export interface TaskRecord {
  id: string;
  description: string;
  type: string;
  status: "queued" | "running" | "completed" | "error";
  created_at: string;
  finished_at?: string;
  logs: { role: string; text: string; ts: string }[];
  result: string | null;
  pipeline_step: string | null;
  progress: number;
}

export interface MemoryEntry {
  id: string;
  timestamp: string;
  description: string;
  summary: string;
}

export interface ApiStatus {
  ok: boolean;
  failures: number;
  cooldown_remaining: number;
}

export function useNexus() {
  const [connected, setConnected]       = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);
  const [agents, setAgents]             = useState<AgentState[]>([]);
  const [tasks, setTasks]               = useState<TaskRecord[]>([]);
  const [logs, setLogs]                 = useState<LogEntry[]>([]);
  const [memory, setMemory]             = useState<MemoryEntry[]>([]);
  const [activeTask, setActiveTask]     = useState<TaskRecord | null>(null);
  const [apiStatus, setApiStatus]       = useState<ApiStatus>({ ok: true, failures: 0, cooldown_remaining: 0 });

  const socketRef = useRef(getSocket());

  useEffect(() => {
    const check = async () => setBackendOnline(await healthCheck());
    check();
    const t = setInterval(check, 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const s = socketRef.current;
    s.on("connect",    () => setConnected(true));
    s.on("disconnect", () => setConnected(false));
    s.on("agents_state",  ({ agents }: { agents: AgentState[] }) => setAgents(agents));
    s.on("task_history",  ({ tasks }: { tasks: TaskRecord[] }) => setTasks(tasks));
    s.on("task_update", ({ task }: { task: TaskRecord }) => {
      setTasks(prev => {
        const idx = prev.findIndex(t => t.id === task.id);
        if (idx === -1) return [task, ...prev];
        const next = [...prev]; next[idx] = task; return next;
      });
      setActiveTask(cur => cur?.id === task.id ? task : cur);
    });
    s.on("agent_log",    (entry: LogEntry) => setLogs(prev => [entry, ...prev].slice(0, 500)));
    s.on("memory_state", ({ memory }: { memory: MemoryEntry[] }) => setMemory(memory));
    s.on("api_status",   (status: ApiStatus) => setApiStatus(status));
    s.on("task_queued",  () => {});
    return () => {
      s.off("connect"); s.off("disconnect"); s.off("agents_state");
      s.off("task_history"); s.off("task_update"); s.off("agent_log");
      s.off("memory_state"); s.off("api_status"); s.off("task_queued");
    };
  }, []);

  const submitTask = useCallback(async (description: string, type = "general") => {
    return apiSubmitTask(description, type);
  }, []);

  return { connected, backendOnline, agents, tasks, logs, memory, activeTask, setActiveTask, submitTask, apiStatus };
}
