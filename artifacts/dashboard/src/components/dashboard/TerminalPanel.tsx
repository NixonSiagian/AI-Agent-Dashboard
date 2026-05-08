import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Maximize2, Minimize2, RotateCcw, X, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { terminalLines } from "@/lib/data";

const lineColor: Record<string, string> = {
  command: "text-cyan-300",
  info:    "text-blue-300",
  success: "text-green-400",
  data:    "text-slate-300",
  warning: "text-yellow-400",
  error:   "text-red-400",
  log:     "text-slate-400",
};

const linePrefix: Record<string, string> = {
  command: "",
  info:    "",
  success: "",
  data:    "  ",
  warning: "",
  error:   "",
  log:     "  ",
};

export function TerminalPanel() {
  const [visibleLines, setVisibleLines] = useState<typeof terminalLines>([]);
  const [expanded, setExpanded] = useState(false);
  const [running, setRunning] = useState(true);
  const [key, setKey] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!running) return;
    setVisibleLines([]);
    const timers: ReturnType<typeof setTimeout>[] = [];

    terminalLines.forEach((line, i) => {
      const t = setTimeout(() => {
        setVisibleLines((prev) => [...prev, line]);
      }, line.delay);
      timers.push(t);
    });

    return () => timers.forEach(clearTimeout);
  }, [running, key]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleLines]);

  const restart = () => {
    setRunning(false);
    setVisibleLines([]);
    setTimeout(() => {
      setRunning(true);
      setKey((k) => k + 1);
    }, 300);
  };

  return (
    <motion.div
      layout
      className={cn(
        "relative rounded-xl border border-border bg-card overflow-hidden flex flex-col",
        expanded ? "fixed inset-4 z-50 shadow-2xl" : "w-full"
      )}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 h-10 border-b border-border bg-muted/20 shrink-0">
        <div className="flex items-center gap-3">
          {/* Traffic lights */}
          <div className="flex items-center gap-1.5">
            <button onClick={() => {}} className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors" />
            <button onClick={() => {}} className="w-3 h-3 rounded-full bg-yellow-400/80 hover:bg-yellow-400 transition-colors" />
            <button onClick={() => {}} className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 transition-colors" />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
            <Terminal size={12} className="text-primary" />
            <span>nexus-cli — prod-east-1</span>
          </div>
          {running && (
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={restart}
            className="p-1.5 rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
            title="Restart"
          >
            <RotateCcw size={13} />
          </button>
          <button
            onClick={() => setExpanded((e) => !e)}
            className="p-1.5 rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
        </div>
      </div>

      {/* Terminal body */}
      <div
        className={cn(
          "flex-1 overflow-y-auto scrollbar-thin p-4 font-mono text-xs leading-relaxed",
          expanded ? "min-h-0" : "h-64"
        )}
        style={{ background: "rgba(5, 10, 20, 0.8)" }}
      >
        <AnimatePresence initial={false}>
          {visibleLines.map((line, i) => (
            <motion.div
              key={`${key}-${i}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
              className={cn("whitespace-pre-wrap break-all", lineColor[line.type], linePrefix[line.type])}
            >
              {line.text === "$ _" ? (
                <span>
                  <span className="text-cyan-300">$ </span>
                  <span className="terminal-cursor" />
                </span>
              ) : (
                line.text
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={endRef} />
      </div>

      {/* Scan line overlay */}
      <div className="absolute inset-0 scan-line pointer-events-none opacity-30" />
    </motion.div>
  );
}
