import { motion } from "framer-motion";
import { Cpu, Zap, CheckCircle2, AlertTriangle } from "lucide-react";

const stats = [
  {
    label: "Active Agents",
    value: "4 / 6",
    sub: "2 offline",
    icon: Zap,
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    border: "border-cyan-400/20",
  },
  {
    label: "Tasks Completed",
    value: "12,707",
    sub: "↑ 18% today",
    icon: CheckCircle2,
    color: "text-green-400",
    bg: "bg-green-400/10",
    border: "border-green-400/20",
  },
  {
    label: "Avg CPU Load",
    value: "49.7%",
    sub: "Across all agents",
    icon: Cpu,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    border: "border-purple-400/20",
  },
  {
    label: "Active Alerts",
    value: "3",
    sub: "1 critical",
    icon: AlertTriangle,
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    border: "border-yellow-400/20",
  },
];

export function StatsBar() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.07 }}
            className={`relative rounded-xl border ${stat.border} ${stat.bg} bg-card p-4 flex items-center gap-3`}
          >
            <div className={`w-10 h-10 rounded-lg ${stat.bg} border ${stat.border} flex items-center justify-center shrink-0`}>
              <Icon size={18} className={stat.color} />
            </div>
            <div className="min-w-0">
              <p className={`text-xl font-bold font-mono ${stat.color}`}>{stat.value}</p>
              <p className="text-[11px] text-muted-foreground leading-tight">{stat.label}</p>
              <p className="text-[10px] text-muted-foreground/60">{stat.sub}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
