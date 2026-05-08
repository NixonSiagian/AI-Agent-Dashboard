import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Loader2, Clock, ChevronDown, ChevronRight, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TaskRecord } from "@/hooks/useNexus";

const statusIcon = {
  queued:    <Clock size={12} className="text-blue-400 shrink-0" />,
  running:   <Loader2 size={12} className="text-yellow-400 animate-spin shrink-0" />,
  completed: <CheckCircle2 size={12} className="text-green-400 shrink-0" />,
  error:     <AlertCircle size={12} className="text-red-400 shrink-0" />,
};

const statusColor = {
  queued:    "text-blue-400 bg-blue-400/10 border-blue-400/20",
  running:   "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  completed: "text-green-400 bg-green-400/10 border-green-400/20",
  error:     "text-red-400 bg-red-400/10 border-red-400/20",
};

const agentColor: Record<string, string> = {
  manager:   "text-cyan-400 border-cyan-400/30 bg-cyan-400/5",
  developer: "text-purple-400 border-purple-400/30 bg-purple-400/5",
  designer:  "text-pink-400 border-pink-400/30 bg-pink-400/5",
  debugger:  "text-orange-400 border-orange-400/30 bg-orange-400/5",
  system:    "text-slate-400 border-slate-400/30 bg-slate-400/5",
};

function TaskRow({ task }: { task: TaskRecord }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-border bg-muted/20 overflow-hidden"
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 sm:gap-3 px-3 py-3 text-left hover:bg-muted/30 active:bg-muted/50 transition-colors touch-manipulation min-h-[48px]"
      >
        {statusIcon[task.status]}
        <span className="flex-1 text-xs text-foreground font-medium truncate min-w-0">{task.description}</span>
        <span className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded border shrink-0", statusColor[task.status])}>
          {task.status.toUpperCase()}
        </span>
        <span className="text-[10px] text-muted-foreground font-mono shrink-0 hidden sm:block">#{task.id}</span>
        {open
          ? <ChevronDown size={12} className="text-muted-foreground shrink-0" />
          : <ChevronRight size={12} className="text-muted-foreground shrink-0" />
        }
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-2 border-t border-border/40">
              {task.logs.map((log, i) => (
                <div key={i} className={cn("rounded border px-2 py-2 text-[10px] sm:text-[11px] font-mono", agentColor[log.role] ?? agentColor.system)}>
                  <span className="font-bold uppercase mr-2">[{log.role}]</span>
                  <span className="text-slate-300 whitespace-pre-wrap break-words">
                    {log.text.slice(0, 500)}{log.text.length > 500 ? "…" : ""}
                  </span>
                </div>
              ))}

              {task.result && (
                <div className="rounded border border-green-500/20 bg-green-500/5 px-3 py-2.5">
                  <p className="text-[10px] font-semibold text-green-400 mb-1.5">Final Output</p>
                  <p className="text-[10px] sm:text-[11px] text-slate-300 font-mono whitespace-pre-wrap break-words">
                    {task.result.slice(0, 600)}{task.result.length > 600 ? "…" : ""}
                  </p>
                </div>
              )}

              {task.status === "running" && task.logs.length === 0 && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground py-1">
                  <Loader2 size={11} className="animate-spin" />
                  Agents are processing…
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface Props {
  tasks: TaskRecord[];
}

export function TaskPanel({ tasks }: Props) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 sm:p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-muted-foreground">
          Task Queue
        </h2>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <Database size={11} />
          <span>{tasks.length} tasks</span>
        </div>
      </div>

      <div className="space-y-2 overflow-y-auto scrollbar-thin" style={{ maxHeight: 320 }}>
        {tasks.length === 0 ? (
          <div className="text-center text-muted-foreground/40 text-xs py-8">
            No tasks yet. Submit one above to get started.
          </div>
        ) : (
          tasks.map((t) => <TaskRow key={t.id} task={t} />)
        )}
      </div>
    </div>
  );
}
