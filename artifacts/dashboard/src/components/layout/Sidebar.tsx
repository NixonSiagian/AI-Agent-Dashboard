import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Grid2X2, Cpu, Terminal, Activity, Layers,
  BarChart2, Settings, ChevronLeft, ChevronRight,
  Zap, Shield
} from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  grid: Grid2X2,
  cpu: Cpu,
  terminal: Terminal,
  activity: Activity,
  layers: Layers,
  "bar-chart-2": BarChart2,
  settings: Settings,
};

interface NavItem {
  label: string;
  icon: string;
  href: string;
  badge?: number;
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: "grid", href: "/" },
  { label: "AI Agents", icon: "cpu", href: "/agents", badge: 6 },
  { label: "Terminal", icon: "terminal", href: "/terminal" },
  { label: "Data Streams", icon: "activity", href: "/streams", badge: 3 },
  { label: "Models", icon: "layers", href: "/models" },
  { label: "Analytics", icon: "bar-chart-2", href: "/analytics" },
  { label: "Settings", icon: "settings", href: "/settings" },
];

interface SidebarProps {
  activeRoute?: string;
  onNavigate?: (href: string) => void;
}

export function Sidebar({ activeRoute = "/", onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex flex-col h-full bg-sidebar border-r border-sidebar-border shrink-0 overflow-hidden"
    >
      {/* Grid bg overlay */}
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />

      {/* Top glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

      {/* Logo */}
      <div className="relative flex items-center h-16 px-4 border-b border-sidebar-border shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center glow-cyan">
              <Zap size={16} className="text-primary" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary animate-pulse" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="min-w-0"
              >
                <p className="text-sm font-bold tracking-widest text-primary glow-text-cyan uppercase">
                  NEXUS
                </p>
                <p className="text-[10px] text-muted-foreground tracking-wider uppercase">
                  Control Plane
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nav items */}
      <nav className="relative flex-1 py-4 px-2 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const Icon = iconMap[item.icon] ?? Grid2X2;
          const isActive = activeRoute === item.href;
          return (
            <button
              key={item.href}
              onClick={() => onNavigate?.(item.href)}
              className={cn(
                "group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-left",
                isActive
                  ? "sidebar-item-active text-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
              )}
            >
              <Icon
                size={18}
                className={cn(
                  "shrink-0 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="text-sm font-medium flex-1 whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {!collapsed && item.badge && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30"
                >
                  {item.badge}
                </motion.span>
              )}
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full glow-cyan"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* System status */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative mx-3 mb-3 p-3 rounded-lg border border-sidebar-border bg-sidebar-accent/50"
          >
            <div className="flex items-center gap-2 mb-2">
              <Shield size={12} className="text-primary" />
              <span className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
                System Status
              </span>
            </div>
            <div className="space-y-1.5">
              {[
                { label: "Cluster", value: "ONLINE", ok: true },
                { label: "Agents", value: "4/6 Active", ok: true },
                { label: "Alerts", value: "1 Error", ok: false },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">{s.label}</span>
                  <span className={cn("text-[10px] font-medium", s.ok ? "text-green-400" : "text-red-400")}>
                    {s.value}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="relative flex items-center justify-center h-10 border-t border-sidebar-border text-muted-foreground hover:text-primary transition-colors"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </motion.aside>
  );
}
