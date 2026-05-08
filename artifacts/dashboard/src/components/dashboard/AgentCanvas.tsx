import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { AgentState, TaskRecord, LogEntry } from "@/hooks/useNexus";

/* ── Agent definitions ──────────────────────────────────────────────── */
const AGENTS = [
  { id: "manager",    label: "Manager",    icon: "🧠", color: "#00dcff", glow: "rgba(0,220,255,0.6)",   border: "border-cyan-500/50",   bg: "bg-cyan-500/10",   text: "text-cyan-300" },
  { id: "researcher", label: "Researcher", icon: "🔬", color: "#a855f7", glow: "rgba(168,85,247,0.6)",  border: "border-purple-500/50", bg: "bg-purple-500/10", text: "text-purple-300" },
  { id: "developer",  label: "Developer",  icon: "💻", color: "#3b82f6", glow: "rgba(59,130,246,0.6)",  border: "border-blue-500/50",   bg: "bg-blue-500/10",   text: "text-blue-300" },
  { id: "debugger",   label: "Debugger",   icon: "🔍", color: "#f97316", glow: "rgba(249,115,22,0.6)",  border: "border-orange-500/50", bg: "bg-orange-500/10", text: "text-orange-300" },
  { id: "deployment", label: "Deployment", icon: "🚀", color: "#22c55e", glow: "rgba(34,197,94,0.6)",   border: "border-green-500/50",  bg: "bg-green-500/10",  text: "text-green-300" },
];

/* ── Animated particle along a connection line ───────────────────────── */
function FlowParticle({ fromIdx, toIdx, active, color }: {
  fromIdx: number; toIdx: number; active: boolean; color: string;
}) {
  if (!active) return null;
  return (
    <motion.circle
      r={3}
      fill={color}
      filter={`drop-shadow(0 0 4px ${color})`}
      initial={{ offsetDistance: "0%" }}
      animate={{ offsetDistance: "100%" }}
      transition={{ duration: 1.4, repeat: Infinity, ease: "linear", repeatDelay: 0.2 }}
    />
  );
}

/* ── SVG connection lines ────────────────────────────────────────────── */
function ConnectionLines({ positions, activeStep, agents }: {
  positions: { x: number; y: number }[];
  activeStep: string | null;
  agents: AgentState[];
}) {
  if (positions.length < 2) return null;

  const agentIdx = (id: string) => AGENTS.findIndex((a) => a.id === id);
  const activeIdx = activeStep ? agentIdx(activeStep) : -1;

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: "visible" }}>
      <defs>
        {AGENTS.map((a, i) => (
          <marker
            key={a.id}
            id={`arrow-${a.id}`}
            markerWidth="6" markerHeight="6"
            refX="3" refY="3"
            orient="auto"
          >
            <path d="M0,0 L0,6 L6,3 z" fill={a.color} opacity={0.7} />
          </marker>
        ))}
      </defs>

      {AGENTS.slice(0, -1).map((agent, i) => {
        const from = positions[i];
        const to   = positions[i + 1];
        if (!from || !to) return null;

        const isActive = i < activeIdx || (i === activeIdx - 1 && activeIdx >= 0);
        const isPulsing = i === activeIdx - 1;
        const nextAgent = AGENTS[i + 1];

        const mx = (from.x + to.x) / 2;
        const my = (from.y + to.y) / 2;

        return (
          <g key={agent.id}>
            {/* Base dim line */}
            <line
              x1={from.x} y1={from.y} x2={to.x} y2={to.y}
              stroke={agent.color}
              strokeWidth={1}
              strokeDasharray="4 6"
              opacity={0.2}
            />
            {/* Active glowing line */}
            {isActive && (
              <motion.line
                x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                stroke={agent.color}
                strokeWidth={isPulsing ? 2.5 : 1.5}
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: isPulsing ? [0.7, 1, 0.7] : 0.7 }}
                transition={{ duration: 0.5, opacity: { duration: 1, repeat: Infinity } }}
                style={{ filter: `drop-shadow(0 0 4px ${agent.color})` }}
                markerEnd={`url(#arrow-${agent.id})`}
              />
            )}
            {/* Data particle */}
            {isPulsing && (
              <motion.circle
                r={3.5}
                fill={agent.color}
                style={{ filter: `drop-shadow(0 0 6px ${agent.color})` }}
                animate={{
                  cx: [from.x, mx, to.x],
                  cy: [from.y, my, to.y],
                  opacity: [0, 1, 1, 0],
                }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ── Single agent node card ──────────────────────────────────────────── */
function AgentNode({
  agent,
  meta,
  isActive,
  isPipelineStep,
  latestLog,
  isMobile,
}: {
  agent: AgentState | undefined;
  meta: typeof AGENTS[0];
  isActive: boolean;
  isPipelineStep: boolean;
  latestLog: string;
  isMobile: boolean;
}) {
  const progress = agent?.progress ?? 0;
  const status   = agent?.status ?? "idle";
  const done     = agent?.tasks_done ?? 0;

  return (
    <motion.div
      animate={isPipelineStep ? { scale: [1, 1.03, 1] } : { scale: 1 }}
      transition={{ duration: 1.6, repeat: isPipelineStep ? Infinity : 0 }}
      className={cn(
        "relative rounded-xl border p-3 bg-card/80 backdrop-blur-sm transition-all duration-300 select-none",
        meta.border, meta.bg,
        isPipelineStep && "shadow-[0_0_24px_var(--agent-glow)]",
      )}
      style={{ "--agent-glow": meta.glow } as React.CSSProperties}
    >
      {/* Pulse ring when active */}
      {isPipelineStep && (
        <motion.div
          className={cn("absolute inset-0 rounded-xl border-2", meta.border)}
          animate={{ opacity: [0.2, 0.8, 0.2], scale: [1, 1.02, 1] }}
          transition={{ duration: 1.4, repeat: Infinity }}
        />
      )}

      {/* Corner status dot */}
      <span
        className={cn(
          "absolute top-2 right-2 w-2 h-2 rounded-full",
          status === "working" ? "bg-yellow-400 animate-ping" :
          status === "idle"    ? "bg-green-400" : "bg-red-400"
        )}
      />

      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div
          className={cn("w-8 h-8 rounded-lg border flex items-center justify-center text-base shrink-0", meta.border, meta.bg)}
          style={{ boxShadow: isPipelineStep ? `0 0 12px ${meta.glow}` : undefined }}
        >
          {meta.icon}
        </div>
        <div className="min-w-0">
          <p className={cn("text-xs font-bold uppercase tracking-widest font-mono", meta.text)}>{meta.label}</p>
          <p className="text-[9px] text-muted-foreground/60">agent/{meta.id}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 rounded-full bg-muted/30 mb-2 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: meta.color, boxShadow: `0 0 6px ${meta.glow}` }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Live thought bubble */}
      <AnimatePresence mode="wait">
        {isPipelineStep && latestLog && (
          <motion.p
            key={latestLog.slice(0, 30)}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="text-[9px] text-muted-foreground/80 font-mono truncate leading-tight"
          >
            {latestLog.replace(/^\[.*?\]\s*/, "")}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Footer stats */}
      <div className="flex items-center justify-between mt-1.5">
        <span className={cn(
          "text-[9px] font-semibold px-1.5 py-0.5 rounded border",
          status === "working" ? "text-yellow-400 border-yellow-400/30 bg-yellow-400/10" :
          "text-green-400 border-green-400/30 bg-green-400/10"
        )}>
          {status === "working" ? `${progress}%` : "IDLE"}
        </span>
        <span className="text-[9px] text-muted-foreground/50 font-mono">{done} done</span>
      </div>

      {/* Thinking animation dots */}
      {isPipelineStep && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 mt-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-1 h-1 rounded-full"
              style={{ background: meta.color }}
              animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.18 }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

/* ── Main export ─────────────────────────────────────────────────────── */
interface Props {
  agents: AgentState[];
  activeTask: TaskRecord | null;
  logs: LogEntry[];
  connected: boolean;
}

export function AgentCanvas({ agents, activeTask, logs, connected }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [positions, setPositions] = useState<{ x: number; y: number }[]>([]);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  const agentMap = Object.fromEntries(agents.map((a) => [a.id, a]));
  const activeStep = activeTask?.pipeline_step ?? null;

  // Latest log per agent
  const latestLogByAgent: Record<string, string> = {};
  for (const log of logs) {
    if (!latestLogByAgent[log.agent_id]) {
      latestLogByAgent[log.agent_id] = log.message;
    }
  }

  // Compute node center positions for SVG lines
  useEffect(() => {
    const update = () => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const pts = nodeRefs.current.map((el) => {
        if (!el) return { x: 0, y: 0 };
        const r = el.getBoundingClientRect();
        return {
          x: r.left - rect.left + r.width / 2,
          y: r.top  - rect.top  + r.height / 2,
        };
      });
      setPositions(pts);
      setIsMobile(window.innerWidth < 640);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [agents, activeTask]);

  const progress = activeTask?.progress ?? 0;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          </div>
          <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
            Agent Operations Center
          </span>
        </div>
        <div className="flex items-center gap-3">
          {activeTask && (
            <div className="flex items-center gap-2">
              <div className="w-24 sm:w-36 h-1.5 rounded-full bg-muted/40 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-500"
                  style={{ boxShadow: "0 0 8px rgba(0,220,255,0.5)" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <span className="text-[10px] font-mono text-cyan-400">{progress}%</span>
            </div>
          )}
          <div className={cn(
            "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border",
            connected
              ? "text-green-400 bg-green-400/10 border-green-400/20"
              : "text-red-400 bg-red-400/10 border-red-400/20"
          )}>
            <span className={cn("w-1.5 h-1.5 rounded-full", connected ? "bg-green-400 animate-pulse" : "bg-red-400")} />
            {connected ? "LIVE" : "OFFLINE"}
          </div>
        </div>
      </div>

      {/* Canvas area */}
      <div
        ref={containerRef}
        className="relative p-3 sm:p-5"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(0,220,255,0.04) 0%, transparent 60%), rgba(4,8,18,0.6)",
        }}
      >
        {/* SVG connection lines overlay */}
        <ConnectionLines positions={positions} activeStep={activeStep} agents={agents} />

        {/* Grid dots */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(0,220,255,0.4) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Agent nodes — horizontal on mobile, single row always */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {AGENTS.map((meta, i) => {
            const agent = agentMap[meta.id];
            const isActive = agent?.status === "working";
            const isPipelineStep = activeStep === meta.id;

            return (
              <div
                key={meta.id}
                ref={(el) => { nodeRefs.current[i] = el; }}
              >
                <AgentNode
                  agent={agent}
                  meta={meta}
                  isActive={isActive}
                  isPipelineStep={isPipelineStep}
                  latestLog={latestLogByAgent[meta.id] ?? ""}
                  isMobile={isMobile}
                />
              </div>
            );
          })}
        </div>

        {/* Active task info strip */}
        <AnimatePresence>
          {activeTask && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 px-3 py-2 rounded-lg border border-cyan-500/20 bg-cyan-500/5 overflow-hidden"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] text-cyan-400/60 font-mono uppercase tracking-wider">Active:</span>
                <span className="text-[11px] text-cyan-100 font-mono truncate flex-1">{activeTask.description}</span>
                {activeStep && (
                  <motion.span
                    key={activeStep}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 font-semibold uppercase tracking-wider"
                  >
                    {activeStep} →
                  </motion.span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
