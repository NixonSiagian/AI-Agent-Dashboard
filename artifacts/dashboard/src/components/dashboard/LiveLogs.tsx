import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Trash2, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LogEntry } from "@/hooks/useNexus";

const agentColor: Record<string, { text: string; badge: string }> = {
  manager:    { text: "text-cyan-300",   badge: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
  researcher: { text: "text-purple-300", badge: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  developer:  { text: "text-blue-300",   badge: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  debugger:   { text: "text-orange-300", badge: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  deployment: { text: "text-green-300",  badge: "bg-green-500/20 text-green-400 border-green-500/30" },
  system:     { text: "text-slate-300",  badge: "bg-slate-500/20 text-slate-400 border-slate-500/30" },
};

interface Props {
  logs: LogEntry[];
  onClear?: () => void;
}

export function LiveLogs({ logs, onClear }: Props) {
  const endRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const userScrolledRef = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || userScrolledRef.current) return;
    el.scrollTop = el.scrollHeight;
  }, [logs.length]);

  return (
    <div className="rounded-xl border border-border bg-card flex flex-col overflow-hidden h-full min-h-0"
      style={{ background: "rgba(4,8,18,0.9)" }}>

      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 h-10 border-b border-border/60 bg-muted/10 shrink-0">
        <div className="flex items-center gap-2">
          <Terminal size={12} className="text-cyan-400" />
          <span className="text-xs font-semibold text-cyan-400/80 font-mono tracking-widest">LIVE LOGS</span>
          {logs.length > 0 && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-mono">
              {logs.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Blinking cursor indicator */}
          <motion.div
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-1.5 h-3 bg-cyan-400 rounded-sm"
          />
          {onClear && (
            <button
              onClick={onClear}
              className="p-1.5 rounded hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
            >
              <Trash2 size={11} />
            </button>
          )}
        </div>
      </div>

      {/* Scan line effect */}
      <div className="absolute inset-0 scan-line pointer-events-none opacity-30 z-0" />

      {/* Log body */}
      <div
        ref={containerRef}
        onScroll={(e) => {
          const el = e.currentTarget;
          const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
          userScrolledRef.current = !isAtBottom;
        }}
        className="relative flex-1 overflow-y-auto scrollbar-thin px-3 py-2 font-mono space-y-1 min-h-0"
      >
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground/30 gap-3 py-8">
            <Activity size={20} />
            <span className="text-[11px] text-center">Awaiting agent transmissions…</span>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {logs.map((log, i) => {
              const colors = agentColor[log.agent_id] ?? agentColor.system;
              const time = new Date(log.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
              const cleanMsg = log.message.replace(/^\[.*?\]\s*/, "");
              return (
                <motion.div
                  key={`${log.ts}-${i}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-start gap-1.5 text-[10px] sm:text-[11px] leading-relaxed"
                >
                  <span className="text-muted-foreground/30 shrink-0 tabular-nums mt-0.5">{time}</span>
                  <span className={cn("shrink-0 px-1 py-0.5 rounded border text-[9px] font-bold uppercase", colors.badge)}>
                    {log.agent_id.slice(0, 5)}
                  </span>
                  <span className={cn("break-words min-w-0 flex-1", colors.text)}>{cleanMsg}</span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}
