export type AgentStatus = "active" | "idle" | "error" | "training";

export interface Agent {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  model: string;
  tasksCompleted: number;
  uptime: string;
  cpuUsage: number;
  memoryUsage: number;
  lastActivity: string;
  color: string;
}

export const agents: Agent[] = [
  {
    id: "agt-001",
    name: "NEXUS-7",
    role: "Research Analyst",
    status: "active",
    model: "GPT-4o",
    tasksCompleted: 1842,
    uptime: "99.8%",
    cpuUsage: 67,
    memoryUsage: 42,
    lastActivity: "2s ago",
    color: "cyan",
  },
  {
    id: "agt-002",
    name: "ARIA-3",
    role: "Code Synthesizer",
    status: "active",
    model: "Claude 3.7",
    tasksCompleted: 3201,
    uptime: "99.9%",
    cpuUsage: 83,
    memoryUsage: 61,
    lastActivity: "Just now",
    color: "purple",
  },
  {
    id: "agt-003",
    name: "ORION-X",
    role: "Data Pipeline",
    status: "idle",
    model: "Gemini 2.5",
    tasksCompleted: 987,
    uptime: "97.2%",
    cpuUsage: 12,
    memoryUsage: 28,
    lastActivity: "4m ago",
    color: "green",
  },
  {
    id: "agt-004",
    name: "SIGMA-9",
    role: "Security Monitor",
    status: "active",
    model: "GPT-4o",
    tasksCompleted: 5490,
    uptime: "100%",
    cpuUsage: 45,
    memoryUsage: 37,
    lastActivity: "1s ago",
    color: "orange",
  },
  {
    id: "agt-005",
    name: "ECHO-2",
    role: "NLP Processor",
    status: "training",
    model: "Mistral-L",
    tasksCompleted: 421,
    uptime: "88.5%",
    cpuUsage: 91,
    memoryUsage: 78,
    lastActivity: "Training",
    color: "pink",
  },
  {
    id: "agt-006",
    name: "VEGA-1",
    role: "Vision Engine",
    status: "error",
    model: "LLaVA-34B",
    tasksCompleted: 762,
    uptime: "94.1%",
    cpuUsage: 0,
    memoryUsage: 15,
    lastActivity: "12m ago",
    color: "red",
  },
];

export interface NavItem {
  label: string;
  icon: string;
  href: string;
  badge?: number;
}

export const navItems: NavItem[] = [
  { label: "Dashboard", icon: "grid", href: "/" },
  { label: "AI Agents", icon: "cpu", href: "/agents", badge: 6 },
  { label: "Terminal", icon: "terminal", href: "/terminal" },
  { label: "Data Streams", icon: "activity", href: "/streams", badge: 3 },
  { label: "Models", icon: "layers", href: "/models" },
  { label: "Analytics", icon: "bar-chart-2", href: "/analytics" },
  { label: "Settings", icon: "settings", href: "/settings" },
];

export const terminalLines = [
  { delay: 0,    text: "$ nexus-cli init --env production", type: "command" },
  { delay: 600,  text: "▶ Initializing NEXUS control plane v3.8.2...", type: "info" },
  { delay: 1200, text: "✔ Connected to cluster: prod-east-1", type: "success" },
  { delay: 1800, text: "✔ Loaded 6 agent manifests", type: "success" },
  { delay: 2400, text: "$ nexus-cli agents --status all", type: "command" },
  { delay: 3000, text: "▶ Querying agent pool...", type: "info" },
  { delay: 3600, text: "NEXUS-7   [ACTIVE]   CPU:67%  MEM:42%  Tasks:1842", type: "data" },
  { delay: 3800, text: "ARIA-3    [ACTIVE]   CPU:83%  MEM:61%  Tasks:3201", type: "data" },
  { delay: 4000, text: "ORION-X   [IDLE]     CPU:12%  MEM:28%  Tasks:987", type: "data" },
  { delay: 4200, text: "SIGMA-9   [ACTIVE]   CPU:45%  MEM:37%  Tasks:5490", type: "data" },
  { delay: 4400, text: "ECHO-2    [TRAINING] CPU:91%  MEM:78%  Tasks:421", type: "warning" },
  { delay: 4600, text: "VEGA-1    [ERROR]    CPU:0%   MEM:15%  Tasks:762", type: "error" },
  { delay: 5200, text: "$ nexus-cli monitor --stream live", type: "command" },
  { delay: 5800, text: "▶ Streaming telemetry from production cluster...", type: "info" },
  { delay: 6400, text: "[2026-05-08 12:41:03] ARIA-3 completed task #3201 — synthetic data gen", type: "log" },
  { delay: 7000, text: "[2026-05-08 12:41:07] SIGMA-9 flagged anomaly in subnet 10.0.4.x", type: "warning" },
  { delay: 7600, text: "[2026-05-08 12:41:11] NEXUS-7 summarized 42 research papers", type: "log" },
  { delay: 8200, text: "[2026-05-08 12:41:18] ECHO-2 training epoch 14/50 — loss: 0.0314", type: "info" },
  { delay: 8800, text: "[2026-05-08 12:41:24] VEGA-1 restart attempt 3/5 failed — OOM", type: "error" },
  { delay: 9400, text: "$ _", type: "command" },
];
