import { AgentCard } from "./AgentCard";
import { agents } from "@/lib/data";

export function AgentGrid() {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold tracking-wider uppercase text-muted-foreground">
            AI Agents
          </h2>
          <p className="text-xs text-muted-foreground/60 mt-0.5">
            {agents.filter((a) => a.status === "active").length} of {agents.length} active
          </p>
        </div>
        <button className="text-xs text-primary hover:underline font-medium">
          View all →
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {agents.map((agent, i) => (
          <AgentCard key={agent.id} agent={agent} index={i} />
        ))}
      </div>
    </section>
  );
}
