import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Loader2, Clock, ChevronDown, ChevronRight, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TaskRecord } from "@/hooks/useNexus";

const statusIcon = {
  queued:    <Clock size={12} className="text-blue-400" />,
  running:   <Loader2 size={12} className="text-yellow-400 animate-spin" />,
  completed: <CheckCircle2 size={12} className="text-green-400" />,
  error:     <AlertCircle size={12} className="text-red-400" />,
};

const statusColor = {
  queued:    "text-blue-400 bg-blue-400/10 border-blue-400/20",
  running:   "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  completed: "text-green-400 bg-green-400/10 border-green-400/20",
  error:     "text-red-400 bg-red-400/10 border-red-400/20",
};

const agentColor: Record<string, string> = {
  manager:   "text-cyan-400 border-cyan-400/30",
  developer: "text-purple-400 border-purple-400/30",
  designer:  "text-pink-400 border-pink-400/30",
  debugger:  "text-orange-400 border-orange-400/30",
  system:    "text-slate-400 border-slate-400/30",
};

function TaskRow({ task }: { task: TaskRecord }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-border bg-muted/20 overflow-hidden"
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-muted/30 transition-colors"
      >
        {statusIcon[task.status]}
        <span className="flex-1 text-xs text-foreground font-medium truncate">{task.description}</span>
        <span className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded border", statusColor[task.status])}>
          {task.status.toUpperCase()}
        </span>
        <span className="text-[10px] text-muted-foreground font-mono">#{task.id}</span>
        {open ? <ChevronDown size={12} className="text-muted-foreground" /> : <ChevronRight size={12} className="text-muted-foreground" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-2 border-t border-border/40">
              {task.logs.map((log, i) => (
                <div key={i} className={cn("rounded border px-2 py-1.5 text-[11px] font-mono", agentColor[log.role] ?? agentColor.system)}>
                  <span className="font-bold uppercase mr-2">[{log.role}]</span>
                  <span className="text-slate-300 whitespace-pre-wrap">{log.text.slice(0, 600)}{log.text.length > 600 ? "…" : ""}</span>
                </div>
              ))}

              {task.result && (
                <div className="rounded border border-green-500/20 bg-green-500/5 px-3 py-2">
                  <p className="text-[10px] font-semibold text-green-400 mb-1">Final Output (Debugger)</p>
                  <p className="text-[11px] text-slate-300 font-mono whitespace-pre-wrap">{task.result.slice(0, 800)}{task.result.length > 800 ? "…" : ""}</p>
                </div>
              )}

              {task.status === "running" && task.logs.length === 0 && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 size={12} className="animate-spin" />
                  Agents are processing...
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
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wider uppercase text-muted-foreground">
          Task Queue
        </h2>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <Database size={11} />
          <span>{tasks.length} tasks</span>
        </div>
      </div>

      <div className="space-y-2 overflow-y-auto scrollbar-thin" style={{ maxHeight: 360 }}>
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
