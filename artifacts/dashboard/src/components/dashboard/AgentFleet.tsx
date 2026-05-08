import { motion } from "framer-motion";
import { Cpu, Zap, CheckCircle2, Clock, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AgentState } from "@/hooks/useNexus";

const agentMeta: Record<string, { color: string; border: string; bg: string; bar: string; icon: string }> = {
  manager:   { color: "text-cyan-400",   border: "border-cyan-500/30",   bg: "bg-cyan-500/5",   bar: "bg-cyan-400",   icon: "🧠" },
  developer: { color: "text-purple-400", border: "border-purple-500/30", bg: "bg-purple-500/5", bar: "bg-purple-400", icon: "💻" },
  designer:  { color: "text-pink-400",   border: "border-pink-500/30",   bg: "bg-pink-500/5",   bar: "bg-pink-400",   icon: "🎨" },
  debugger:  { color: "text-orange-400", border: "border-orange-500/30", bg: "bg-orange-500/5", bar: "bg-orange-400", icon: "🔍" },
};

const fallback = { color: "text-slate-400", border: "border-slate-500/30", bg: "bg-slate-500/5", bar: "bg-slate-400", icon: "🤖" };

const StatusIcon = ({ status }: { status: string }) => {
  if (status === "working") return <Loader2 size={12} className="text-yellow-400 animate-spin" />;
  if (status === "idle") return <CheckCircle2 size={12} className="text-green-400" />;
  return <AlertCircle size={12} className="text-red-400" />;
};

interface Props {
  agents: AgentState[];
  connected: boolean;
}

export function AgentFleet({ agents, connected }: Props) {
  const displayAgents = agents.length > 0
    ? agents
    : (["manager", "developer", "designer", "debugger"] as const).map((id) => ({
        id, role: id.charAt(0).toUpperCase() + id.slice(1),
        goal: "Waiting for connection...", status: "idle" as const,
        current_task: null, tasks_done: 0,
      }));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold tracking-wider uppercase text-muted-foreground">AI Agent Fleet</h2>
          <p className="text-xs text-muted-foreground/60 mt-0.5">
            {agents.filter((a) => a.status === "working").length} agents working
          </p>
        </div>
        <div className={cn("flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider border",
          connected
            ? "bg-green-500/10 border-green-500/20 text-green-400"
            : "bg-red-500/10 border-red-500/20 text-red-400"
        )}>
          <span className={cn("w-1.5 h-1.5 rounded-full", connected ? "bg-green-400 animate-pulse" : "bg-red-400")} />
          {connected ? "CONNECTED" : "OFFLINE"}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {displayAgents.map((agent, i) => {
          const meta = agentMeta[agent.id] ?? fallback;
          return (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={cn(
                "relative rounded-xl border p-4 bg-card transition-all duration-300",
                meta.border, meta.bg,
                agent.status === "working" && "shadow-[0_0_20px_rgba(250,200,0,0.08)]"
              )}
            >
              {/* Working pulse ring */}
              {agent.status === "working" && (
                <motion.div
                  className="absolute inset-0 rounded-xl border border-yellow-400/20"
                  animate={{ opacity: [0.3, 0.8, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}

              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center border text-lg", meta.border, meta.bg)}>
                    {meta.icon}
                  </div>
                  <div>
                    <p className={cn("text-sm font-bold font-mono tracking-wide uppercase", meta.color)}>
                      {agent.role}
                    </p>
                    <p className="text-[10px] text-muted-foreground leading-tight max-w-[140px] truncate">
                      {agent.goal}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <StatusIcon status={agent.status} />
                  <span className={cn(
                    "text-[10px] font-semibold",
                    agent.status === "working" ? "text-yellow-400" :
                    agent.status === "idle" ? "text-green-400" : "text-red-400"
                  )}>
                    {agent.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {agent.current_task && (
                <div className="mb-2 px-2 py-1 rounded bg-muted/40 border border-border/40">
                  <p className="text-[10px] text-muted-foreground font-mono truncate">
                    Task: {agent.current_task}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between text-[10px] text-muted-foreground border-t border-border/30 pt-2 mt-2">
                <div className="flex items-center gap-1">
                  <CheckCircle2 size={9} />
                  <span className={cn("font-mono font-semibold", meta.color)}>{agent.tasks_done}</span>
                  <span>completed</span>
                </div>
                <span className="font-mono">agent/{agent.id}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
