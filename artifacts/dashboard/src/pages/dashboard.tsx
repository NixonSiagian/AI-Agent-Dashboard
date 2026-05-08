import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsBar } from "@/components/dashboard/StatsBar";
import { AgentGrid } from "@/components/dashboard/AgentGrid";
import { TerminalPanel } from "@/components/dashboard/TerminalPanel";

export default function DashboardPage() {
  return (
    <DashboardLayout title="Dashboard">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <StatsBar />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Agent cards — takes 2/3 */}
          <div className="xl:col-span-2">
            <AgentGrid />
          </div>

          {/* Terminal panel — takes 1/3 */}
          <div className="xl:col-span-1 flex flex-col gap-4">
            <div>
              <h2 className="text-sm font-semibold tracking-wider uppercase text-muted-foreground mb-4">
                Live Terminal
              </h2>
              <TerminalPanel />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
