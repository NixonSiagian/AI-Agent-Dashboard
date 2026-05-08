import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AgentCanvas } from "@/components/dashboard/AgentCanvas";
import { AgentFleet } from "@/components/dashboard/AgentFleet";
import { LiveLogs } from "@/components/dashboard/LiveLogs";
import { TaskSubmit } from "@/components/dashboard/TaskSubmit";
import { TaskPanel } from "@/components/dashboard/TaskPanel";
import { MemoryPanel } from "@/components/dashboard/MemoryPanel";
import { useNexus } from "@/hooks/useNexus";
import { motion } from "framer-motion";
import { Cpu, CheckCircle2, AlertTriangle, Brain, Zap } from "lucide-react";

function StatCard({ label, value, sub, icon: Icon, color, border, bg, delay }: {
  label: string; value: string; sub: string; delay: number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string; border: string; bg: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className={`relative rounded-xl border ${border} ${bg} bg-card p-3 sm:p-4 flex items-center gap-2.5`}
    >
      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg ${bg} border ${border} flex items-center justify-center shrink-0`}>
        <Icon size={16} className={color} />
      </div>
      <div className="min-w-0">
        <p className={`text-lg sm:text-xl font-bold font-mono leading-none ${color}`}>{value}</p>
        <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-tight mt-0.5">{label}</p>
        <p className="text-[9px] text-muted-foreground/50">{sub}</p>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const {
    connected, backendOnline,
    agents, tasks, logs, memory,
    activeTask, setActiveTask, submitTask,
  } = useNexus();

  const [localLogs, setLocalLogs] = useState(logs);

  const activeAgents   = agents.filter(a => a.status === "working").length;
  const completedTasks = tasks.filter(t => t.status === "completed").length;
  const errorTasks     = tasks.filter(t => t.status === "error").length;
  const runningTasks   = tasks.filter(t => t.status === "running").length;

  const handleSubmit = async (description: string, type: string) => {
    const result = await submitTask(description, type);
    setActiveTask({
      id: result.task_id, description, type,
      status: "queued", created_at: new Date().toISOString(),
      logs: [], result: null, pipeline_step: null, progress: 0,
    });
    return result;
  };

  return (
    <DashboardLayout title="AI Operating System">
      <div className="max-w-[1600px] mx-auto space-y-3 sm:space-y-4 lg:space-y-5">

        {/* ── Stat row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          <StatCard delay={0}    label="Active Agents"  value={`${activeAgents}/${agents.length || 5}`}  sub={backendOnline ? "Gemini powered" : "Connecting…"}  icon={Cpu}           color="text-cyan-400"   border="border-cyan-400/20"   bg="bg-cyan-400/10" />
          <StatCard delay={0.05} label="Tasks Done"     value={String(completedTasks)}                   sub={`${runningTasks} running`}                          icon={CheckCircle2}  color="text-green-400"  border="border-green-400/20"  bg="bg-green-400/10" />
          <StatCard delay={0.10} label="Memory"         value={String(memory.length)}                    sub="Agent context"                                      icon={Brain}         color="text-purple-400" border="border-purple-400/20" bg="bg-purple-400/10" />
          <StatCard delay={0.15} label="Errors"         value={String(errorTasks)}                       sub={connected ? "Socket live" : "Disconnected"}         icon={AlertTriangle} color={errorTasks > 0 ? "text-red-400" : "text-yellow-400"} border={errorTasks > 0 ? "border-red-400/20" : "border-yellow-400/20"} bg={errorTasks > 0 ? "bg-red-400/10" : "bg-yellow-400/10"} />
        </div>

        {/* ── 2D Agent Canvas — the main feature ── */}
        <AgentCanvas
          agents={agents}
          activeTask={activeTask}
          logs={logs}
          connected={connected}
        />

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
          {/* Left */}
          <div className="xl:col-span-2 space-y-3 sm:space-y-4">
            <AgentFleet agents={agents} connected={connected} />
            <TaskSubmit onSubmit={handleSubmit} disabled={!backendOnline} />
            <TaskPanel tasks={tasks} />
          </div>

          {/* Right */}
          <div className="xl:col-span-1 flex flex-col gap-3 sm:gap-4">
            <div className="h-72 sm:h-80 xl:h-96">
              <LiveLogs logs={logs} />
            </div>
            <MemoryPanel memory={memory} />
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
