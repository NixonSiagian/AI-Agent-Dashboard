import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AgentFleet } from "@/components/dashboard/AgentFleet";
import { LiveLogs } from "@/components/dashboard/LiveLogs";
import { TaskSubmit } from "@/components/dashboard/TaskSubmit";
import { TaskPanel } from "@/components/dashboard/TaskPanel";
import { WorkflowViz } from "@/components/dashboard/WorkflowViz";
import { MemoryPanel } from "@/components/dashboard/MemoryPanel";
import { useNexus } from "@/hooks/useNexus";
import { motion } from "framer-motion";
import { Cpu, CheckCircle2, AlertTriangle, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

function StatCard({ label, value, sub, icon: Icon, color, border, bg }: {
  label: string; value: string; sub: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string; border: string; bg: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-xl border ${border} ${bg} bg-card p-4 flex items-center gap-3`}
    >
      <div className={`w-10 h-10 rounded-lg ${bg} border ${border} flex items-center justify-center shrink-0`}>
        <Icon size={18} className={color} />
      </div>
      <div className="min-w-0">
        <p className={`text-xl font-bold font-mono ${color}`}>{value}</p>
        <p className="text-[11px] text-muted-foreground leading-tight">{label}</p>
        <p className="text-[10px] text-muted-foreground/60">{sub}</p>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { connected, backendOnline, agents, tasks, logs, memory, activeTask, setActiveTask, submitTask } = useNexus();
  const [logList, setLogList] = useState(logs);

  // Sync logs from hook
  const displayLogs = logs;

  const activeAgents = agents.filter(a => a.status === "working").length;
  const completedTasks = tasks.filter(t => t.status === "completed").length;
  const errorTasks = tasks.filter(t => t.status === "error").length;
  const runningTasks = tasks.filter(t => t.status === "running").length;

  const handleSubmit = async (description: string, type: string) => {
    const result = await submitTask(description, type);
    // find and set as active
    setActiveTask({ id: result.task_id, description, type, status: "queued", created_at: new Date().toISOString(), logs: [], result: null });
    return result;
  };

  return (
    <DashboardLayout title="AI Operating System">
      <div className="max-w-[1600px] mx-auto space-y-5">

        {/* Status bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Active Agents"
            value={`${activeAgents} / ${agents.length || 4}`}
            sub={backendOnline ? "Backend online" : "Connecting..."}
            icon={Cpu}
            color="text-cyan-400"
            border="border-cyan-400/20"
            bg="bg-cyan-400/10"
          />
          <StatCard
            label="Tasks Completed"
            value={String(completedTasks)}
            sub={`${runningTasks} running now`}
            icon={CheckCircle2}
            color="text-green-400"
            border="border-green-400/20"
            bg="bg-green-400/10"
          />
          <StatCard
            label="Memory Entries"
            value={String(memory.length)}
            sub="Persistent agent memory"
            icon={Brain}
            color="text-purple-400"
            border="border-purple-400/20"
            bg="bg-purple-400/10"
          />
          <StatCard
            label="Errors"
            value={String(errorTasks)}
            sub={connected ? "Socket connected" : "Socket offline"}
            icon={AlertTriangle}
            color={errorTasks > 0 ? "text-red-400" : "text-yellow-400"}
            border={errorTasks > 0 ? "border-red-400/20" : "border-yellow-400/20"}
            bg={errorTasks > 0 ? "bg-red-400/10" : "bg-yellow-400/10"}
          />
        </div>

        {/* Workflow visualization */}
        <WorkflowViz agents={agents} activeTask={activeTask} />

        {/* Main grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

          {/* Left: agents + task submit + task list */}
          <div className="xl:col-span-2 space-y-5">
            <AgentFleet agents={agents} connected={connected} />
            <TaskSubmit onSubmit={handleSubmit} disabled={!backendOnline} />
            <TaskPanel tasks={tasks} />
          </div>

          {/* Right: live logs + memory */}
          <div className="xl:col-span-1 flex flex-col gap-5">
            <div className="flex-1 min-h-0" style={{ height: 420 }}>
              <LiveLogs logs={displayLogs} />
            </div>
            <MemoryPanel memory={memory} />
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
