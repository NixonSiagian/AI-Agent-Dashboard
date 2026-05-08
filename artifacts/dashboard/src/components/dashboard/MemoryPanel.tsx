import { motion } from "framer-motion";
import { Brain, Clock } from "lucide-react";
import type { MemoryEntry } from "@/hooks/useNexus";

interface Props {
  memory: MemoryEntry[];
}

export function MemoryPanel({ memory }: Props) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Brain size={14} className="text-primary" />
        <h2 className="text-sm font-semibold tracking-wider uppercase text-muted-foreground">
          Agent Memory
        </h2>
        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 font-mono ml-auto">
          {memory.length} entries
        </span>
      </div>

      <div className="space-y-1.5 overflow-y-auto scrollbar-thin" style={{ maxHeight: 200 }}>
        {memory.length === 0 ? (
          <div className="text-center text-muted-foreground/40 text-xs py-4">
            Memory builds as agents complete tasks
          </div>
        ) : (
          memory.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-start gap-2 px-2 py-1.5 rounded-lg bg-muted/20 border border-border/30 hover:bg-muted/40 transition-colors"
            >
              <Brain size={10} className="text-primary/60 mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-foreground truncate">{entry.summary}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Clock size={8} className="text-muted-foreground/40" />
                  <span className="text-[9px] text-muted-foreground/50 font-mono">
                    {new Date(entry.timestamp).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
              <span className="text-[9px] font-mono text-muted-foreground/40 shrink-0">#{entry.id}</span>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
