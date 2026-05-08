import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Bell, ChevronDown, User, Wifi,
  Activity, Clock, X
} from "lucide-react";

interface NavbarProps {
  title?: string;
}

const notifications = [
  { id: 1, type: "error",   message: "VEGA-1 restart failed — OOM",          time: "2m ago" },
  { id: 2, type: "warning", message: "SIGMA-9 flagged anomaly in subnet",      time: "5m ago" },
  { id: 3, type: "info",    message: "ECHO-2 training epoch 14/50 complete",   time: "12m ago" },
];

const typeColor: Record<string, string> = {
  error:   "bg-red-500",
  warning: "bg-yellow-400",
  info:    "bg-cyan-400",
};

export function Navbar({ title = "Dashboard" }: NavbarProps) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="relative h-16 flex items-center gap-4 px-6 border-b border-border bg-card/50 backdrop-blur-sm shrink-0">
      {/* Top glow line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent pointer-events-none" />

      {/* Page title */}
      <div className="flex items-center gap-2 mr-auto">
        <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>NEXUS</span>
          <span className="opacity-40">/</span>
          <span className="text-foreground font-semibold">{title}</span>
        </div>
        {/* Live indicator */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 ml-4">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] font-semibold text-green-400 tracking-wider">LIVE</span>
        </div>
      </div>

      {/* Search */}
      <motion.div
        animate={{ width: searchFocused ? 280 : 200 }}
        transition={{ duration: 0.2 }}
        className="relative hidden sm:block"
      >
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        />
        <input
          type="text"
          placeholder="Search agents, tasks..."
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          className="w-full h-9 pl-9 pr-4 rounded-lg bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:bg-muted/80 transition-all"
        />
        {searchFocused && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <kbd className="text-[10px] px-1 py-0.5 rounded border border-border text-muted-foreground">⌘K</kbd>
          </div>
        )}
      </motion.div>

      {/* Cluster health */}
      <div className="hidden lg:flex items-center gap-4">
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

      {/* Notification bell */}
      <div className="relative">
        <button
          onClick={() => { setNotifOpen((o) => !o); setProfileOpen(false); }}
          className="relative flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-muted/30 hover:bg-muted/60 hover:border-primary/30 transition-all"
        >
          <Bell size={16} className="text-muted-foreground" />
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 border border-background text-[9px] font-bold text-white flex items-center justify-center">
            {notifications.length}
          </span>
        </button>
        <AnimatePresence>
          {notifOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-11 w-80 rounded-xl border border-border bg-card shadow-lg z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <span className="text-sm font-semibold">Notifications</span>
                <button onClick={() => setNotifOpen(false)}>
                  <X size={14} className="text-muted-foreground hover:text-foreground" />
                </button>
              </div>
              {notifications.map((n) => (
                <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-muted/30 transition-colors border-b border-border/50 last:border-0">
                  <span className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${typeColor[n.type]}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground leading-snug">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{n.time}</p>
                  </div>
                </div>
              ))}
              <div className="px-4 py-2 text-center">
                <button className="text-xs text-primary hover:underline">View all</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Profile */}
      <div className="relative">
        <button
          onClick={() => { setProfileOpen((o) => !o); setNotifOpen(false); }}
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg border border-border hover:border-primary/30 hover:bg-muted/30 transition-all"
        >
          <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
            <User size={14} className="text-primary" />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold leading-none">Admin</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Operator</p>
          </div>
          <ChevronDown size={12} className="text-muted-foreground" />
        </button>
        <AnimatePresence>
          {profileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-11 w-48 rounded-xl border border-border bg-card shadow-lg z-50 overflow-hidden py-1"
            >
              {["Profile", "API Keys", "Preferences", "Logout"].map((item) => (
                <button
                  key={item}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted/40 transition-colors text-foreground"
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
