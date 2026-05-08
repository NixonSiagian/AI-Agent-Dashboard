import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { AgentState, TaskRecord, LogEntry, ApiStatus } from "@/hooks/useNexus";

/* ── Station definitions ────────────────────────────────────────────────────── */
interface Station {
  id: string; label: string; icon: string;
  color: string; glow: string; border: string; bg: string;
  x: number; y: number; // percent of container
}

const STATIONS: Station[] = [
  { id: "manager",    label: "Command Hub",      icon: "🖥",  color: "#00dcff", glow: "rgba(0,220,255,0.5)",  border: "border-cyan-500/50",   bg: "bg-cyan-500/10",   x: 8,  y: 10 },
  { id: "researcher", label: "Research Lab",     icon: "🔬", color: "#a855f7", glow: "rgba(168,85,247,0.5)", border: "border-purple-500/50", bg: "bg-purple-500/10", x: 60, y: 10 },
  { id: "developer",  label: "Code Station",     icon: "💾", color: "#3b82f6", glow: "rgba(59,130,246,0.5)", border: "border-blue-500/50",   bg: "bg-blue-500/10",   x: 8,  y: 55 },
  { id: "debugger",   label: "Debug Terminal",   icon: "⚠",  color: "#f97316", glow: "rgba(249,115,22,0.5)", border: "border-orange-500/50", bg: "bg-orange-500/10", x: 60, y: 55 },
  { id: "deployment", label: "Deploy Bay",       icon: "🛰", color: "#22c55e", glow: "rgba(34,197,94,0.5)",  border: "border-green-500/50",  bg: "bg-green-500/10",  x: 34, y: 78 },
];

/* ── Agent meta ──────────────────────────────────────────────────────────────── */
const AGENTS = [
  { id: "manager",    label: "Manager",    avatar: "🧠", color: "#00dcff", stationId: "manager"    },
  { id: "researcher", label: "Researcher", avatar: "🔬", color: "#a855f7", stationId: "researcher" },
  { id: "developer",  label: "Developer",  avatar: "💻", color: "#3b82f6", stationId: "developer"  },
  { id: "debugger",   label: "Debugger",   avatar: "🔍", color: "#f97316", stationId: "debugger"   },
  { id: "deployment", label: "Deploy",     avatar: "🚀", color: "#22c55e", stationId: "deployment" },
];

/* ── Tiny clock ──────────────────────────────────────────────────────────────── */
function SimClock() {
  const [t, setT] = useState(new Date());
  useEffect(() => { const i = setInterval(() => setT(new Date()), 1000); return () => clearInterval(i); }, []);
  return (
    <span className="font-mono text-[11px] text-cyan-400/80 tabular-nums">
      {t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
    </span>
  );
}

/* ── Station tile ────────────────────────────────────────────────────────────── */
function StationTile({ s, isActive }: { s: Station; isActive: boolean }) {
  return (
    <div
      className={cn("absolute flex flex-col items-center gap-1 pointer-events-none select-none")}
      style={{ left: `${s.x}%`, top: `${s.y}%`, transform: "translate(-50%, -50%)" }}
    >
      {/* Platform */}
      <motion.div
        animate={isActive ? { boxShadow: [`0 0 8px ${s.glow}`, `0 0 22px ${s.glow}`, `0 0 8px ${s.glow}`] } : {}}
        transition={{ duration: 1.4, repeat: Infinity }}
        className={cn(
          "w-16 h-10 sm:w-20 sm:h-12 rounded-lg border flex flex-col items-center justify-center gap-0.5",
          s.border, s.bg, "bg-card/60 backdrop-blur-sm"
        )}
      >
        <span className="text-base sm:text-lg">{s.icon}</span>
      </motion.div>
      <span className="text-[8px] sm:text-[9px] font-mono text-muted-foreground/60 tracking-wider text-center whitespace-nowrap">
        {s.label.toUpperCase()}
      </span>
    </div>
  );
}

/* ── Animated agent avatar ───────────────────────────────────────────────────── */
function AgentAvatar({
  meta, agentState, stationX, stationY, isActive, latestLog, isSim,
}: {
  meta: typeof AGENTS[0];
  agentState: AgentState | undefined;
  stationX: number; stationY: number;
  isActive: boolean;
  latestLog: string;
  isSim: boolean;
}) {
  const status   = agentState?.status ?? "idle";
  const progress = agentState?.progress ?? 0;
  const done     = agentState?.tasks_done ?? 0;

  // Idle agents gently drift ±4px around station; active agents sit on station
  const idleOffset = useRef({ x: Math.random() * 8 - 4, y: Math.random() * 8 - 4 });

  return (
    <motion.div
      className="absolute"
      animate={{
        left: `${stationX}%`,
        top:  `calc(${stationY}% - ${isActive ? 52 : 44}px)`,
      }}
      transition={{ type: "spring", stiffness: 80, damping: 18 }}
      style={{ transform: "translateX(-50%)" }}
    >
      {/* Task thought bubble */}
      <AnimatePresence>
        {isActive && latestLog && (
          <motion.div
            key={latestLog.slice(0, 20)}
            initial={{ opacity: 0, y: 4, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 whitespace-nowrap max-w-[140px]"
          >
            <div
              className="text-[8px] sm:text-[9px] px-2 py-1 rounded-lg border font-mono truncate"
              style={{
                background: `${meta.color}15`,
                borderColor: `${meta.color}40`,
                color: meta.color,
                boxShadow: `0 0 8px ${meta.color}30`,
              }}
            >
              {latestLog.replace(/^\[.*?\]\s*/, "").slice(0, 40)}…
            </div>
            {/* Bubble tail */}
            <div className="w-2 h-1 mx-auto" style={{ borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderTop: `5px solid ${meta.color}40` }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Avatar body */}
      <motion.div
        animate={
          status === "working"
            ? { scale: [1, 1.08, 1], y: [0, -2, 0] }
            : { scale: [1, 1.01, 1], y: [0, -1, 0] }
        }
        transition={{ duration: status === "working" ? 0.7 : 2.5, repeat: Infinity }}
        className="relative flex flex-col items-center gap-0.5 cursor-pointer"
      >
        {/* Glow ring when active */}
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            style={{ boxShadow: `0 0 14px 4px ${meta.color}60`, borderRadius: "50%" }}
          />
        )}

        {/* Avatar circle */}
        <div
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center text-base sm:text-lg"
          style={{
            background: `${meta.color}18`,
            borderColor: `${meta.color}70`,
            boxShadow: isActive ? `0 0 10px ${meta.color}50` : undefined,
          }}
        >
          {meta.avatar}
        </div>

        {/* Name tag */}
        <div
          className="text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border font-mono"
          style={{
            color: meta.color,
            background: `${meta.color}15`,
            borderColor: `${meta.color}40`,
          }}
        >
          {meta.label}
        </div>

        {/* Progress bar */}
        {isActive && (
          <div className="w-12 sm:w-14 h-0.5 rounded-full bg-white/10 overflow-hidden mt-0.5">
            <motion.div
              className="h-full rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
              style={{ background: meta.color, boxShadow: `0 0 4px ${meta.color}` }}
            />
          </div>
        )}

        {/* Typing dots when working */}
        {status === "working" && (
          <div className="flex gap-0.5 mt-0.5">
            {[0, 1, 2].map(i => (
              <motion.span
                key={i}
                className="w-1 h-1 rounded-full"
                style={{ background: meta.color }}
                animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.3, 0.8] }}
                transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
        )}

        {/* SIM badge */}
        {isSim && isActive && (
          <span className="text-[7px] px-1 py-0.5 rounded border border-yellow-400/30 bg-yellow-400/10 text-yellow-400 font-mono font-bold">
            SIM
          </span>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ── Animated SVG flow lines between stations ────────────────────────────────── */
function FlowLines({
  containerRef, activeStep, previousStep,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  activeStep: string | null;
  previousStep: string | null;
}) {
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setSize({ w: containerRef.current.offsetWidth, h: containerRef.current.offsetHeight });
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  if (!size.w || !activeStep || !previousStep) return null;

  const from = STATIONS.find(s => s.id === previousStep);
  const to   = STATIONS.find(s => s.id === activeStep);
  if (!from || !to) return null;

  const fx = (from.x / 100) * size.w;
  const fy = (from.y / 100) * size.h;
  const tx = (to.x / 100) * size.w;
  const ty = (to.y / 100) * size.h;
  const mx = (fx + tx) / 2;
  const my = (fy + ty) / 2;

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: "visible" }}>
      <motion.path
        d={`M ${fx} ${fy} Q ${mx} ${fy} ${tx} ${ty}`}
        fill="none"
        stroke={to.color}
        strokeWidth={1.5}
        strokeDasharray="6 4"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.6 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{ filter: `drop-shadow(0 0 3px ${to.color})` }}
      />
      {/* Data packet particle */}
      <motion.circle
        r={4}
        fill={to.color}
        style={{ filter: `drop-shadow(0 0 5px ${to.color})` }}
        animate={{ offsetDistance: ["0%", "100%"], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </svg>
  );
}

/* ── API Status Banner ───────────────────────────────────────────────────────── */
function ApiBanner({ apiStatus }: { apiStatus: ApiStatus }) {
  if (apiStatus.ok) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-yellow-400/30 bg-yellow-400/10 text-yellow-400 text-[10px] font-mono"
    >
      <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }}>⚠</motion.span>
      <span>
        SIMULATION MODE — Gemini quota exceeded.
        {apiStatus.cooldown_remaining > 0 && ` API retry in ${apiStatus.cooldown_remaining}s.`}
        {" "}Agents running locally.
      </span>
    </motion.div>
  );
}

/* ── Main SimWorld ───────────────────────────────────────────────────────────── */
interface Props {
  agents: AgentState[];
  activeTask: TaskRecord | null;
  logs: LogEntry[];
  connected: boolean;
  apiStatus: ApiStatus;
}

export function SimWorld({ agents, activeTask, logs, connected, apiStatus }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const agentMap = Object.fromEntries(agents.map(a => [a.id, a]));
  const activeStep = activeTask?.pipeline_step ?? null;
  const progress   = activeTask?.progress ?? 0;

  // Track previous step for flow lines
  const prevStepRef = useRef<string | null>(null);
  const [prevStep, setPrevStep] = useState<string | null>(null);
  useEffect(() => {
    if (activeStep && activeStep !== prevStepRef.current) {
      setPrevStep(prevStepRef.current);
      prevStepRef.current = activeStep;
    }
  }, [activeStep]);

  // Latest log per agent
  const latestLogByAgent: Record<string, string> = {};
  for (const log of logs) {
    if (!latestLogByAgent[log.agent_id]) latestLogByAgent[log.agent_id] = log.message;
  }

  // Detect simulation mode from logs
  const isSimMode = !apiStatus.ok || logs.some(l => l.message.includes("[SIM]") || l.message.includes("SIMULATION MODE"));

  // Auto-bounce idle agents every few seconds so world feels alive
  const [idleBounce, setIdleBounce] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdleBounce(n => n + 1), 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden flex flex-col">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 border-b border-border bg-muted/20 shrink-0 flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap gap-y-1">
          <div className="flex items-center gap-1.5">
            <motion.div
              className="w-2 h-2 rounded-full bg-cyan-400"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-xs font-bold tracking-widest uppercase text-cyan-400/90 font-mono">
              NEXUS Simulation World
            </span>
          </div>
          <SimClock />
          {isSimMode && (
            <span className="text-[9px] px-1.5 py-0.5 rounded border border-yellow-400/30 bg-yellow-400/10 text-yellow-400 font-mono font-bold">
              SIM MODE
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap gap-y-1">
          {/* Pipeline progress */}
          {activeTask && (
            <div className="flex items-center gap-1.5">
              <div className="w-20 sm:w-28 h-1 rounded-full bg-muted/40 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-500"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <span className="text-[10px] font-mono text-cyan-400">{progress}%</span>
            </div>
          )}
          <div className={cn(
            "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border",
            connected ? "text-green-400 bg-green-400/10 border-green-400/20" : "text-red-400 bg-red-400/10 border-red-400/20"
          )}>
            <span className={cn("w-1.5 h-1.5 rounded-full", connected ? "bg-green-400 animate-pulse" : "bg-red-400")} />
            {connected ? "LIVE" : "OFFLINE"}
          </div>
        </div>
      </div>

      {/* ── API Banner ── */}
      <AnimatePresence>
        {!apiStatus.ok && (
          <div className="px-3 py-1.5 border-b border-yellow-400/20">
            <ApiBanner apiStatus={apiStatus} />
          </div>
        )}
      </AnimatePresence>

      {/* ── Simulation map ── */}
      <div
        ref={containerRef}
        className="relative overflow-hidden"
        style={{
          height: "clamp(260px, 40vw, 420px)",
          background: `
            radial-gradient(ellipse at 20% 20%, rgba(0,220,255,0.04) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(168,85,247,0.04) 0%, transparent 50%),
            rgba(4, 8, 20, 0.95)
          `,
        }}
      >
        {/* Grid floor */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,220,255,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,220,255,0.04) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Subtle scanline */}
        <div className="absolute inset-0 pointer-events-none opacity-20 scan-line" />

        {/* Flow lines between steps */}
        <FlowLines containerRef={containerRef} activeStep={activeStep} previousStep={prevStep} />

        {/* Station tiles */}
        {STATIONS.map(s => (
          <StationTile key={s.id} s={s} isActive={activeStep === s.id} />
        ))}

        {/* Agent avatars */}
        {AGENTS.map(meta => {
          const station    = STATIONS.find(s => s.id === meta.stationId)!;
          const isActive   = activeStep === meta.id;
          const agentState = agentMap[meta.id];
          return (
            <AgentAvatar
              key={meta.id}
              meta={meta}
              agentState={agentState}
              stationX={station.x}
              stationY={station.y}
              isActive={isActive}
              latestLog={latestLogByAgent[meta.id] ?? ""}
              isSim={isSimMode}
            />
          );
        })}

        {/* Active task strip */}
        <AnimatePresence>
          {activeTask && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-2 left-2 right-2 px-3 py-1.5 rounded-lg border border-cyan-500/20 bg-black/60 backdrop-blur-sm"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[9px] text-cyan-400/50 font-mono uppercase tracking-wider shrink-0">Task:</span>
                <span className="text-[10px] text-cyan-100 font-mono truncate flex-1 min-w-0">{activeTask.description}</span>
                {activeStep && (
                  <motion.span
                    key={activeStep}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-[9px] px-1.5 py-0.5 rounded border border-yellow-400/30 bg-yellow-400/10 text-yellow-400 font-mono font-bold shrink-0"
                  >
                    {activeStep.toUpperCase()} ▶
                  </motion.span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Idle world message */}
        {!activeTask && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.p
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-[11px] text-cyan-400/40 font-mono tracking-widest uppercase"
            >
              Agents Standby — Submit a Task to Deploy
            </motion.p>
          </div>
        )}
      </div>

      {/* ── Agent status bar ── */}
      <div className="flex items-center gap-0 border-t border-border overflow-x-auto scrollbar-thin shrink-0">
        {AGENTS.map((meta, i) => {
          const a = agentMap[meta.id];
          const isWorking = a?.status === "working";
          return (
            <div
              key={meta.id}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 min-w-0 flex-1 border-r border-border/40 last:border-r-0",
                isWorking && "bg-yellow-400/5"
              )}
            >
              <span className="text-sm shrink-0">{meta.avatar}</span>
              <div className="min-w-0">
                <p className="text-[9px] font-bold uppercase font-mono truncate" style={{ color: meta.color }}>
                  {meta.label}
                </p>
                <p className={cn(
                  "text-[8px] font-semibold",
                  isWorking ? "text-yellow-400" : "text-muted-foreground/50"
                )}>
                  {isWorking ? `${a?.progress ?? 0}%` : `${a?.tasks_done ?? 0} done`}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
