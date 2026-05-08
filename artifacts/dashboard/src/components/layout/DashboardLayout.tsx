import { useState, useCallback } from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const [activeRoute, setActiveRoute] = useState("/");
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavigate = useCallback((href: string) => {
    setActiveRoute(href);
    setMobileOpen(false);
  }, []);

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-background">
      {/* Sidebar — hidden on mobile unless drawer open */}
      <Sidebar
        activeRoute={activeRoute}
        onNavigate={handleNavigate}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar
          title={title}
          onMenuToggle={() => setMobileOpen((o) => !o)}
          mobileMenuOpen={mobileOpen}
        />
        <main className="flex-1 overflow-y-auto scrollbar-thin p-3 sm:p-4 lg:p-6 safe-bottom">
          {children}
        </main>
      </div>
    </div>
  );
}
