import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Loader2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AgentState, TaskRecord } from "@/hooks/useNexus";

const PIPELINE = [
  { id: "manager",   label: "Manager",   icon: "🧠", color: "cyan" },
  { id: "developer", label: "Developer", icon: "💻", color: "purple" },
  { id: "designer",  label: "Designer",  icon: "🎨", color: "pink" },
  { id: "debugger",  label: "Debugger",  icon: "🔍", color: "orange" },
];

const colorMap: Record<string, { text: string; border: string; bg: string; glow: string }> = {
  cyan:   { text: "text-cyan-400",   border: "border-cyan-500/40",   bg: "bg-cyan-500/10",   glow: "shadow-[0_0_16px_rgba(0,220,255,0.2)]" },
  purple: { text: "text-purple-400", border: "border-purple-500/40", bg: "bg-purple-500/10", glow: "shadow-[0_0_16px_rgba(120,60,255,0.2)]" },
  pink:   { text: "text-pink-400",   border: "border-pink-500/40",   bg: "bg-pink-500/10",   glow: "shadow-[0_0_16px_rgba(240,60,150,0.2)]" },
  orange: { text: "text-orange-400", border: "border-orange-500/40", bg: "bg-orange-500/10", glow: "shadow-[0_0_16px_rgba(250,140,0,0.2)]" },
};

interface Props {
  agents: AgentState[];
  activeTask: TaskRecord | null;
}

export function WorkflowViz({ agents, activeTask }: Props) {
  const agentMap = Object.fromEntries(agents.map((a) => [a.id, a]));

  const getStepStatus = (agentId: string): "done" | "active" | "pending" => {
    if (!activeTask) return "pending";
    const logRoles = activeTask.logs.map((l) => l.role);
    if (logRoles.includes(agentId)) {
      const agent = agentMap[agentId];
      if (agent?.status === "working") return "active";
      return "done";
    }
    const anyWorking = agents.some((a) => a.status === "working");
    return anyWorking ? "pending" : "pending";
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold tracking-wider uppercase text-muted-foreground">
          Workflow Pipeline
        </h2>
        {activeTask && (
          <span className={cn(
            "text-[10px] font-semibold px-2 py-0.5 rounded-full border",
            activeTask.status === "running"   ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" :
            activeTask.status === "completed" ? "text-green-400 bg-green-400/10 border-green-400/20" :
            "text-blue-400 bg-blue-400/10 border-blue-400/20"
          )}>
            {activeTask.status.toUpperCase()}
          </span>
        )}
      </div>

      {/* Pipeline flow */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {PIPELINE.map((step, idx) => {
          const status = getStepStatus(step.id);
          const c = colorMap[step.color];
          const agent = agentMap[step.id];

          return (
            <div key={step.id} className="flex items-center gap-1 shrink-0">
              <motion.div
                animate={status === "active" ? { scale: [1, 1.03, 1] } : {}}
                transition={{ duration: 1.2, repeat: Infinity }}
                className={cn(
                  "relative flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-xl border min-w-[80px]",
                  c.border, c.bg,
                  status === "active" && c.glow
                )}
              >
                {status === "active" && (
                  <motion.div
                    className={cn("absolute inset-0 rounded-xl border", c.border)}
                    animate={{ opacity: [0.2, 0.7, 0.2] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
                <span className="text-xl">{step.icon}</span>
                <span className={cn("text-[10px] font-bold uppercase tracking-wide", c.text)}>
                  {step.label}
                </span>
                <div className="flex items-center gap-1">
                  {status === "active"  && <Loader2 size={9} className="text-yellow-400 animate-spin" />}
                  {status === "done"    && <CheckCircle2 size={9} className="text-green-400" />}
                  {status === "pending" && <Circle size={9} className="text-muted-foreground/40" />}
                  <span className="text-[9px] text-muted-foreground capitalize">{status}</span>
                </div>
                {agent && (
                  <span className="text-[9px] font-mono text-muted-foreground/50">
                    {agent.tasks_done} tasks
                  </span>
                )}
              </motion.div>

              {idx < PIPELINE.length - 1 && (
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: idx * 0.3 }}
                >
                  <ArrowRight size={14} className="text-muted-foreground/40 mx-0.5" />
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      {activeTask && (
        <div className="mt-3 px-3 py-2 rounded-lg bg-muted/30 border border-border/40">
          <p className="text-[10px] text-muted-foreground mb-0.5">Active task</p>
          <p className="text-xs text-foreground truncate">{activeTask.description}</p>
        </div>
      )}
    </div>
  );
}
