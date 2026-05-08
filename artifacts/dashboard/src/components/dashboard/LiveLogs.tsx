import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LogEntry } from "@/hooks/useNexus";

const agentColor: Record<string, string> = {
  manager:   "text-cyan-400",
  developer: "text-purple-400",
  designer:  "text-pink-400",
  debugger:  "text-orange-400",
  system:    "text-slate-400",
};

interface Props {
  logs: LogEntry[];
  onClear?: () => void;
}

export function LiveLogs({ logs, onClear }: Props) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs.length]);

  return (
    <div className="rounded-xl border border-border bg-card flex flex-col overflow-hidden h-full">
      <div className="flex items-center justify-between px-4 h-10 border-b border-border bg-muted/20 shrink-0">
        <div className="flex items-center gap-2">
          <Activity size={13} className="text-primary" />
          <span className="text-xs font-semibold text-foreground">Live Agent Logs</span>
          {logs.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 font-mono">
              {logs.length}
            </span>
          )}
        </div>
        {onClear && (
          <button onClick={onClear} className="p-1 rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors">
            <Trash2 size={12} />
          </button>
        )}
      </div>

      <div
        className="flex-1 overflow-y-auto scrollbar-thin p-3 font-mono text-[11px] leading-relaxed space-y-0.5"
        style={{ background: "rgba(4, 8, 18, 0.85)", minHeight: 0 }}
      >
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground/40 text-xs gap-2">
            <Activity size={24} />
            <span>Submit a task to see live agent output</span>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {[...logs].reverse().map((log, i) => (
              <motion.div
                key={`${log.task_id}-${log.ts}-${i}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15 }}
                className="flex gap-2 items-start"
              >
                <span className="text-muted-foreground/40 shrink-0 text-[9px] mt-0.5 font-mono">
                  {new Date(log.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </span>
                <span className={cn("shrink-0 font-bold text-[10px] uppercase w-16", agentColor[log.agent_id] ?? "text-slate-400")}>
                  [{log.agent_id}]
                </span>
                <span className="text-slate-300 break-all">{log.message}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}
