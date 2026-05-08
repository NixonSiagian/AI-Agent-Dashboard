import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Loader2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const EXAMPLE_TASKS = [
  "Build a REST API for a todo app with authentication in FastAPI",
  "Create a React component for a real-time data visualization dashboard",
  "Write a Python script that scrapes news headlines and summarizes them",
  "Design a PostgreSQL schema for a multi-tenant SaaS application",
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
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold tracking-wider uppercase text-muted-foreground">
          Submit Task to Agents
        </h2>
        <button
          onClick={() => setShowExamples((s) => !s)}
          className="flex items-center gap-1 text-[10px] text-primary hover:underline"
        >
          Examples <ChevronDown size={10} className={cn("transition-transform", showExamples && "rotate-180")} />
        </button>
      </div>

      {showExamples && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-3 grid grid-cols-1 gap-1.5"
        >
          {EXAMPLE_TASKS.map((task) => (
            <button
              key={task}
              onClick={() => { setDescription(task); setShowExamples(false); }}
              className="text-left text-[11px] px-3 py-2 rounded-lg bg-muted/30 hover:bg-muted/60 border border-border/40 text-muted-foreground hover:text-foreground transition-all truncate"
            >
              {task}
            </button>
          ))}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what you want the AI agents to build, research, or solve..."
          rows={3}
          disabled={disabled || loading}
          className="w-full px-3 py-2.5 rounded-lg bg-muted/40 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none transition-all disabled:opacity-50 font-mono"
        />

        <div className="flex items-center gap-3">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            disabled={disabled || loading}
            className="px-3 py-2 rounded-lg bg-muted/40 border border-border text-xs text-foreground focus:outline-none focus:border-primary/50 disabled:opacity-50 capitalize"
          >
            {TASK_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <button
            type="submit"
            disabled={!description.trim() || loading || disabled}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 h-9 rounded-lg text-sm font-semibold transition-all",
              "bg-primary text-primary-foreground",
              "hover:shadow-[0_0_20px_rgba(0,220,255,0.3)] hover:brightness-110",
              "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
            )}
          >
            {loading ? (
              <><Loader2 size={14} className="animate-spin" /> Running agents...</>
            ) : (
              <><Send size={14} /> Deploy to Agents</>
            )}
          </button>
        </div>

        {disabled && !loading && (
          <p className="text-[11px] text-yellow-400 text-center">
            Backend offline — start the NEXUS AI Backend workflow
          </p>
        )}
      </form>
    </div>
  );
}
