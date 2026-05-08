import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const EXAMPLE_TASKS = [
  "Build a REST API for a todo app with JWT auth in FastAPI",
  "Create a React dashboard with real-time WebSocket data",
  "Write a Python script that summarizes news headlines with AI",
  "Design a PostgreSQL schema for a multi-tenant SaaS app",
  "Implement a rate limiter middleware for an Express.js API",
  "Build a WebSocket chat server with room support in Node.js",
];

const TASK_TYPES = ["general", "code", "design", "debug", "research", "architecture"];

interface Props {
  onSubmit: (description: string, type: string) => Promise<unknown>;
  disabled?: boolean;
}

export function TaskSubmit({ onSubmit, disabled }: Props) {
  const [description, setDescription] = useState("");
  const [type, setType] = useState("general");
  const [loading, setLoading] = useState(false);
  const [showExamples, setShowExamples] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || loading) return;
    setLoading(true);
    try {
      await onSubmit(description.trim(), type);
      setDescription("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-muted-foreground">
          Submit Task to Agents
        </h2>
        <button
          onClick={() => setShowExamples((s) => !s)}
          className="flex items-center gap-1 text-[11px] text-primary hover:underline active:opacity-70 touch-manipulation py-1"
        >
          Examples
          <ChevronDown size={10} className={cn("transition-transform duration-200", showExamples && "rotate-180")} />
        </button>
      </div>

      {/* Examples list */}
      <AnimatePresence>
        {showExamples && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-3 overflow-hidden"
          >
            <div className="grid grid-cols-1 gap-1.5">
              {EXAMPLE_TASKS.map((task) => (
                <button
                  key={task}
                  onClick={() => { setDescription(task); setShowExamples(false); }}
                  className="text-left text-[11px] sm:text-xs px-3 py-2.5 rounded-lg bg-muted/30 hover:bg-muted/60 active:bg-muted/80 border border-border/40 text-muted-foreground hover:text-foreground transition-all touch-manipulation leading-snug"
                >
                  {task}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what you want the AI agents to build, research, or solve..."
          rows={4}
          disabled={disabled || loading}
          className="w-full px-3 py-3 rounded-lg bg-muted/40 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none transition-all disabled:opacity-50 font-mono leading-relaxed"
          style={{ WebkitAppearance: "none" }}
        />

        <div className="flex items-stretch gap-2.5">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            disabled={disabled || loading}
            className="px-3 py-2.5 rounded-lg bg-muted/40 border border-border text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary/50 disabled:opacity-50 capitalize touch-manipulation shrink-0"
          >
            {TASK_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <button
            type="submit"
            disabled={!description.trim() || loading || disabled}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all touch-manipulation min-h-[44px]",
              "bg-primary text-primary-foreground",
              "hover:shadow-[0_0_20px_rgba(0,220,255,0.3)] hover:brightness-110",
              "active:scale-[0.98] active:brightness-90",
              "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:active:scale-100"
            )}
          >
            {loading ? (
              <><Loader2 size={14} className="animate-spin shrink-0" /><span className="truncate">Running agents…</span></>
            ) : (
              <><Send size={14} className="shrink-0" /><span className="truncate">Deploy to Agents</span></>
            )}
          </button>
        </div>

        {disabled && !loading && (
          <p className="text-[11px] text-yellow-400 text-center py-1">
            Backend offline — start the NEXUS AI Backend workflow
          </p>
        )}
      </form>
    </div>
  );
}
