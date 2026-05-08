import { motion } from "framer-motion";
import { Cpu, MemoryStick, Activity, CheckCircle2, AlertCircle, Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Agent } from "@/lib/data";

const colorConfig: Record<string, {
  border: string;
  bg: string;
  glow: string;
  dot: string;
  text: string;
  bar: string;
}> = {
  cyan:   { border: "border-cyan-500/30",   bg: "bg-cyan-500/5",   glow: "shadow-[0_0_20px_rgba(0,220,255,0.12)]",  dot: "bg-cyan-400",   text: "text-cyan-400",   bar: "bg-cyan-400" },
  purple: { border: "border-purple-500/30", bg: "bg-purple-500/5", glow: "shadow-[0_0_20px_rgba(120,60,255,0.12)]", dot: "bg-purple-400", text: "text-purple-400", bar: "bg-purple-400" },
  green:  { border: "border-green-500/30",  bg: "bg-green-500/5",  glow: "shadow-[0_0_20px_rgba(0,200,100,0.12)]",  dot: "bg-green-400",  text: "text-green-400",  bar: "bg-green-400" },
  orange: { border: "border-orange-500/30", bg: "bg-orange-500/5", glow: "shadow-[0_0_20px_rgba(250,140,0,0.12)]",  dot: "bg-orange-400", text: "text-orange-400", bar: "bg-orange-400" },
  pink:   { border: "border-pink-500/30",   bg: "bg-pink-500/5",   glow: "shadow-[0_0_20px_rgba(240,60,150,0.12)]", dot: "bg-pink-400",   text: "text-pink-400",   bar: "bg-pink-400" },
  red:    { border: "border-red-500/30",    bg: "bg-red-500/5",    glow: "shadow-[0_0_20px_rgba(240,60,60,0.12)]",  dot: "bg-red-400",    text: "text-red-400",    bar: "bg-red-400" },
};

const statusConfig: Record<string, { label: string; icon: React.ComponentType<{size?: number; className?: string}>; textClass: string }> = {
  active:   { label: "Active",   icon: CheckCircle2, textClass: "text-green-400" },
  idle:     { label: "Idle",     icon: Clock,        textClass: "text-yellow-400" },
  error:    { label: "Error",    icon: AlertCircle,  textClass: "text-red-400" },
  training: { label: "Training", icon: Activity,     textClass: "text-pink-400" },
};

function MiniBar({ value, colorClass }: { value: number; colorClass: string }) {
  return (
    <div className="w-full h-1 rounded-full bg-muted/60 overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
        className={cn("h-full rounded-full", colorClass)}
      />
    </div>
  );
}

interface AgentCardProps {
  agent: Agent;
  index: number;
}

export function AgentCard({ agent, index }: AgentCardProps) {
  const colors = colorConfig[agent.color] ?? colorConfig.cyan;
  const status = statusConfig[agent.status] ?? statusConfig.idle;
  const StatusIcon = status.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={cn(
        "relative rounded-xl border p-4 bg-card cursor-default group transition-all duration-300",
        "agent-card-glow",
        colors.border,
        colors.bg,
        colors.glow
      )}
    >
      {/* Top accent line */}
      <div className={cn("absolute top-0 left-6 right-6 h-px rounded-full opacity-60", colors.bar.replace("bg-", "bg-"))} />

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={cn("relative w-9 h-9 rounded-lg flex items-center justify-center border", colors.border, colors.bg)}>
            <Zap size={16} className={colors.text} />
            {agent.status === "active" && (
              <span className={cn("absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-background animate-pulse", colors.dot)} />
            )}
          </div>
          <div>
            <p className={cn("text-sm font-bold font-mono tracking-wide", colors.text)}>
              {agent.name}
            </p>
            <p className="text-[11px] text-muted-foreground">{agent.role}</p>
          </div>
        </div>
        <div className={cn("flex items-center gap-1.5 text-[10px] font-semibold tracking-wide", status.textClass)}>
          <StatusIcon size={11} />
          {status.label}
        </div>
      </div>

      {/* Model tag */}
      <div className="mb-3">
        <span className={cn("text-[10px] font-mono px-2 py-0.5 rounded-full border", colors.border, colors.text)}>
          {agent.model}
        </span>
      </div>

      {/* Metrics */}
      <div className="space-y-2 mb-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Cpu size={10} />
              <span>CPU</span>
            </div>
            <span className={cn("text-[10px] font-mono font-semibold", colors.text)}>{agent.cpuUsage}%</span>
          </div>
          <MiniBar value={agent.cpuUsage} colorClass={colors.bar} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <MemoryStick size={10} />
              <span>Memory</span>
            </div>
            <span className={cn("text-[10px] font-mono font-semibold", colors.text)}>{agent.memoryUsage}%</span>
          </div>
          <MiniBar value={agent.memoryUsage} colorClass={colors.bar} />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border/40 pt-2.5 mt-2.5">
        <div className="text-center">
          <p className={cn("text-sm font-bold font-mono", colors.text)}>{agent.tasksCompleted.toLocaleString()}</p>
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Tasks</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold font-mono text-foreground">{agent.uptime}</p>
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Uptime</p>
        </div>
        <div className="text-center">
          <p className="text-[11px] font-mono text-muted-foreground">{agent.lastActivity}</p>
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Last Active</p>
        </div>
      </div>
    </motion.div>
  );
}
