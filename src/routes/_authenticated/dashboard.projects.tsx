import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Copy, Plus, Check, X, Globe, Code2 } from "lucide-react";
import { useDashboard } from "@/components/dashboard/DashboardShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard/projects")({
  component: ProjectsPage,
});

function ProjectsPage() {
  const { projects, refreshProjects, setCurrentId } = useDashboard();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function create() {
    setErr(null);
    if (!name.trim() || !domain.trim()) {
      setErr("Name and domain are required");
      return;
    }
    setBusy(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setBusy(false); return; }
    const { data, error } = await supabase
      .from("projects")
      .insert({ name: name.trim(), domain: domain.trim(), user_id: user.id })
      .select()
      .single();
    setBusy(false);
    if (error) { setErr(error.message); return; }
    await refreshProjects();
    if (data) setCurrentId(data.id);
    setOpen(false);
    setName(""); setDomain("");
  }

  function snippetFor(key: string) {
    return `<script src="https://widget-voice.lovable.app/widget.js" data-key="${key}" async></script>`;
  }

  function copySnippet(id: string, key: string) {
    navigator.clipboard.writeText(snippetFor(key));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">Each project gets its own widget and feedback inbox.</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <h3 className="text-base font-semibold">No projects yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Create your first project to start collecting feedback.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <div key={p.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5">
              <div>
                <h3 className="text-base font-semibold">{p.name}</h3>
                <div className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Globe className="h-3.5 w-3.5" /> {p.domain}
                </div>
              </div>
              <div className="rounded-lg bg-muted/50 px-3 py-2 font-mono text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Code2 className="h-3.5 w-3.5" />
                  <span className="truncate">{p.widget_key}</span>
                </div>
              </div>
              <button
                onClick={() => copySnippet(p.id, p.widget_key)}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium hover:bg-muted"
              >
                {copiedId === p.id ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedId === p.id ? "Copied snippet" : "Copy snippet"}
              </button>
            </div>
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">New Project</h2>
              <button onClick={() => setOpen(false)} className="rounded-md p-1 text-muted-foreground hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <label className="block">
                <div className="mb-1 text-xs font-medium text-muted-foreground">Project name</div>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Acme app"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </label>
              <label className="block">
                <div className="mb-1 text-xs font-medium text-muted-foreground">Domain</div>
                <input
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="acme.com"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </label>
              {err && <div className="text-sm text-destructive">{err}</div>}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setOpen(false)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted">
                Cancel
              </button>
              <button
                onClick={create}
                disabled={busy}
                className="rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
              >
                {busy ? "Creating…" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
