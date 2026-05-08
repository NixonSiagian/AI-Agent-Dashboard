import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Bell, ChevronDown, User, Wifi,
  Activity, Clock, X, Menu,
} from "lucide-react";

interface NavbarProps {
  title?: string;
  onMenuToggle?: () => void;
  mobileMenuOpen?: boolean;
}

const notifications = [
  { id: 1, type: "error",   message: "VEGA-1 restart failed — OOM",         time: "2m ago" },
  { id: 2, type: "warning", message: "SIGMA-9 flagged anomaly in subnet",     time: "5m ago" },
  { id: 3, type: "info",    message: "ECHO-2 training epoch 14/50 complete",  time: "12m ago" },
];

const typeColor: Record<string, string> = {
  error:   "bg-red-500",
  warning: "bg-yellow-400",
  info:    "bg-cyan-400",
};

export function Navbar({ title = "Dashboard", onMenuToggle, mobileMenuOpen }: NavbarProps) {
  const [searchOpen, setSearchOpen]   = useState(false);
  const [notifOpen, setNotifOpen]     = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const closeAll = () => { setNotifOpen(false); setProfileOpen(false); setSearchOpen(false); };

  return (
    <header className="relative h-14 sm:h-16 flex items-center gap-2 sm:gap-4 px-3 sm:px-5 border-b border-border bg-card/50 backdrop-blur-sm shrink-0 z-30">
      {/* Top glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent pointer-events-none" />

      {/* ── Hamburger (mobile only) */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg border border-border bg-muted/30 hover:bg-muted/60 hover:border-primary/30 transition-all active:scale-95 touch-manipulation"
        aria-label="Open menu"
      >
        <motion.div
          animate={mobileMenuOpen ? "open" : "closed"}
          className="flex flex-col gap-1.5 w-4"
        >
          <motion.span
            variants={{ open: { rotate: 45, y: 6 }, closed: { rotate: 0, y: 0 } }}
            className="block h-0.5 w-full bg-muted-foreground rounded-full origin-center transition-colors"
          />
          <motion.span
            variants={{ open: { opacity: 0, scaleX: 0 }, closed: { opacity: 1, scaleX: 1 } }}
            className="block h-0.5 w-full bg-muted-foreground rounded-full"
          />
          <motion.span
            variants={{ open: { rotate: -45, y: -6 }, closed: { rotate: 0, y: 0 } }}
            className="block h-0.5 w-full bg-muted-foreground rounded-full origin-center transition-colors"
          />
        </motion.div>
      </button>

      {/* ── Title / breadcrumb */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
          <span className="shrink-0">NEXUS</span>
          <span className="opacity-40">/</span>
          <span className="text-foreground font-semibold truncate">{title}</span>
        </div>
        <p className="md:hidden text-sm font-bold text-foreground truncate">{title}</p>
        {/* Live pill */}
        <div className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] font-semibold text-green-400 tracking-wider">LIVE</span>
        </div>
      </div>

      {/* ── Cluster health (lg+) */}
      <div className="hidden lg:flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-1.5">
          <Wifi size={13} className="text-primary" />
          <span className="text-xs text-muted-foreground">Latency:</span>
          <span className="text-xs font-mono font-semibold text-primary">14ms</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Activity size={13} className="text-green-400" />
          <span className="text-xs text-muted-foreground">Uptime:</span>
          <span className="text-xs font-mono font-semibold text-green-400">99.7%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={13} className="text-muted-foreground" />
          <span className="text-xs font-mono text-muted-foreground">
            {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </div>

      {/* ── Search (sm+, expands on focus) */}
      <motion.div
        animate={{ width: searchOpen ? 220 : 36 }}
        transition={{ duration: 0.2 }}
        className="relative hidden sm:block overflow-hidden"
      >
        <Search
          size={14}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10"
        />
        <input
          type="text"
          placeholder="Search..."
          onFocus={() => setSearchOpen(true)}
          onBlur={() => setSearchOpen(false)}
          className="w-full h-9 pl-8 pr-3 rounded-lg bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all"
        />
      </motion.div>

      {/* ── Notifications */}
      <div className="relative shrink-0">
        <button
          onClick={() => { setNotifOpen((o) => !o); setProfileOpen(false); }}
          className="relative flex items-center justify-center w-10 h-10 rounded-lg border border-border bg-muted/30 hover:bg-muted/60 hover:border-primary/30 transition-all active:scale-95 touch-manipulation"
        >
          <Bell size={16} className="text-muted-foreground" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border border-background text-[9px] font-bold text-white flex items-center justify-center">
            {notifications.length}
          </span>
        </button>
        <AnimatePresence>
          {notifOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.96 }}
              transition={{ duration: 0.14 }}
              className="absolute right-0 top-12 w-[calc(100vw-2rem)] sm:w-80 max-w-sm rounded-xl border border-border bg-card shadow-xl z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <span className="text-sm font-semibold">Notifications</span>
                <button onClick={() => setNotifOpen(false)} className="p-1 rounded hover:bg-muted/40">
                  <X size={14} className="text-muted-foreground" />
                </button>
              </div>
              {notifications.map((n) => (
                <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-muted/30 active:bg-muted/50 transition-colors border-b border-border/50 last:border-0">
                  <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${typeColor[n.type]}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground leading-snug">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{n.time}</p>
                  </div>
                </div>
              ))}
              <div className="px-4 py-2.5 text-center">
                <button className="text-xs text-primary font-medium">View all</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Profile */}
      <div className="relative shrink-0">
        <button
          onClick={() => { setProfileOpen((o) => !o); setNotifOpen(false); }}
          className="flex items-center gap-1.5 sm:gap-2 px-2 py-1.5 rounded-lg border border-border hover:border-primary/30 hover:bg-muted/30 transition-all active:scale-95 touch-manipulation"
        >
          <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0">
            <User size={14} className="text-primary" />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold leading-none">Admin</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Operator</p>
          </div>
          <ChevronDown size={12} className="text-muted-foreground hidden sm:block" />
        </button>
        <AnimatePresence>
          {profileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.96 }}
              transition={{ duration: 0.14 }}
              className="absolute right-0 top-12 w-48 rounded-xl border border-border bg-card shadow-xl z-50 overflow-hidden py-1"
            >
              {["Profile", "API Keys", "Preferences", "Logout"].map((item) => (
                <button
                  key={item}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-muted/40 active:bg-muted/60 transition-colors text-foreground"
                >
                  {item}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
