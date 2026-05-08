import { motion, AnimatePresence } from "framer-motion";
import {
  Grid2X2, Cpu, Terminal, Activity, Layers,
  BarChart2, Settings, ChevronLeft, ChevronRight,
  Zap, Shield, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  grid: Grid2X2,
  cpu: Cpu,
  terminal: Terminal,
  activity: Activity,
  layers: Layers,
  "bar-chart-2": BarChart2,
  settings: Settings,
};

const navItems = [
  { label: "Dashboard",    icon: "grid",        href: "/" },
  { label: "AI Agents",   icon: "cpu",         href: "/agents",    badge: 4 },
  { label: "Terminal",    icon: "terminal",    href: "/terminal" },
  { label: "Data Streams",icon: "activity",    href: "/streams",   badge: 3 },
  { label: "Models",      icon: "layers",      href: "/models" },
  { label: "Analytics",   icon: "bar-chart-2", href: "/analytics" },
  { label: "Settings",    icon: "settings",    href: "/settings" },
];

interface SidebarProps {
  activeRoute?: string;
  onNavigate?: (href: string) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

function SidebarContent({
  collapsed,
  activeRoute,
  onNavigate,
  isMobile = false,
  onClose,
}: {
  collapsed: boolean;
  activeRoute: string;
  onNavigate?: (href: string) => void;
  isMobile?: boolean;
  onClose?: () => void;
}) {
  return (
    <div className="relative flex flex-col h-full bg-sidebar overflow-hidden">
      {/* Grid bg */}
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
      {/* Top glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

      {/* Logo row */}
      <div className="relative flex items-center justify-between h-16 px-4 border-b border-sidebar-border shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center glow-cyan">
              <Zap size={16} className="text-primary" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary animate-pulse" />
          </div>
          <AnimatePresence>
            {(!collapsed || isMobile) && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.18 }}
                className="min-w-0"
              >
                <p className="text-sm font-bold tracking-widest text-primary glow-text-cyan uppercase">NEXUS</p>
                <p className="text-[10px] text-muted-foreground tracking-wider uppercase">Control Plane</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {/* Mobile close button */}
        {isMobile && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-sidebar-accent text-muted-foreground hover:text-foreground transition-colors ml-2"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="relative flex-1 py-3 px-2 space-y-0.5 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const Icon = iconMap[item.icon] ?? Grid2X2;
          const isActive = activeRoute === item.href;
          const showLabel = !collapsed || isMobile;
          return (
            <button
              key={item.href}
              onClick={() => onNavigate?.(item.href)}
              className={cn(
                "group relative w-full flex items-center gap-3 rounded-lg transition-all duration-200 text-left",
                showLabel ? "px-3 py-3" : "px-0 py-3 justify-center",
                isActive
                  ? "sidebar-item-active text-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
              )}
            >
              <Icon
                size={isMobile ? 20 : 18}
                className={cn(
                  "shrink-0 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              <AnimatePresence>
                {showLabel && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.12 }}
                    className={cn("font-medium flex-1 whitespace-nowrap", isMobile ? "text-base" : "text-sm")}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {showLabel && item.badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                  {item.badge}
                </span>
              )}
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary rounded-r-full glow-cyan"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* System status — only when expanded */}
      <AnimatePresence>
        {(!collapsed || isMobile) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative mx-3 mb-3 p-3 rounded-lg border border-sidebar-border bg-sidebar-accent/50"
          >
            <div className="flex items-center gap-2 mb-2">
              <Shield size={12} className="text-primary" />
              <span className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">System Status</span>
            </div>
            <div className="space-y-1.5">
              {[
                { label: "Cluster", value: "ONLINE", ok: true },
                { label: "Agents", value: "4 Active", ok: true },
                { label: "Alerts", value: "1 Error", ok: false },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">{s.label}</span>
                  <span className={cn("text-[10px] font-medium", s.ok ? "text-green-400" : "text-red-400")}>{s.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop collapse toggle */}
      {!isMobile && (
        <div className="relative border-t border-sidebar-border">
          <button
            onClick={() => {}}
            className="w-full flex items-center justify-center h-10 text-muted-foreground hover:text-primary transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

export function Sidebar({ activeRoute = "/", onNavigate, mobileOpen = false, onMobileClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* ── DESKTOP sidebar ─────────────────────────────── */}
      <motion.aside
        animate={{ width: collapsed ? 68 : 240 }}
        transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
        className="hidden lg:flex flex-col h-full border-r border-sidebar-border shrink-0 overflow-hidden relative"
      >
        <SidebarContent
          collapsed={collapsed}
          activeRoute={activeRoute}
          onNavigate={onNavigate}
        />
        {/* Collapse toggle overlay at bottom */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="absolute bottom-0 left-0 right-0 flex items-center justify-center h-10 border-t border-sidebar-border bg-sidebar text-muted-foreground hover:text-primary transition-colors z-10"
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </motion.aside>

      {/* ── MOBILE drawer ───────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onMobileClose}
              className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
            {/* Drawer panel */}
            <motion.div
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
              className="lg:hidden fixed top-0 left-0 bottom-0 z-50 w-72 border-r border-sidebar-border shadow-2xl"
            >
              <SidebarContent
                collapsed={false}
                isMobile
                activeRoute={activeRoute}
                onNavigate={onNavigate}
                onClose={onMobileClose}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
