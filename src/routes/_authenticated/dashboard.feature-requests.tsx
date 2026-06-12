import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/dashboard/feature-requests")({
  component: () => (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Feature Requests</h1>
        <p className="mt-1 text-sm text-muted-foreground">See and prioritize what users want next.</p>
      </div>
      <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
        <h3 className="text-base font-semibold">Coming soon</h3>
        <p className="mt-1 text-sm text-muted-foreground">Public voting board for your roadmap.</p>
      </div>
    </div>
  ),
});
