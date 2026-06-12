import { createFileRoute } from "@tanstack/react-router";
import { useDashboard } from "@/components/dashboard/DashboardShell";

export const Route = createFileRoute("/_authenticated/dashboard/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { profile } = useDashboard();
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account.</p>
      </div>
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Email</div>
        <div className="mt-1 text-sm">{profile?.email ?? "—"}</div>
        <div className="mt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">Plan</div>
        <div className="mt-1 inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold uppercase text-primary">
          {profile?.plan ?? "free"}
        </div>
      </div>
    </div>
  );
}
