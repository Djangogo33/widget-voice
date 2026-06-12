import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/dashboard/changelog")({
  component: () => (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Changelog</h1>
        <p className="mt-1 text-sm text-muted-foreground">Publish updates to your users.</p>
      </div>
      <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
        <h3 className="text-base font-semibold">Coming soon</h3>
        <p className="mt-1 text-sm text-muted-foreground">Write release notes and share them via your widget.</p>
      </div>
    </div>
  ),
});
