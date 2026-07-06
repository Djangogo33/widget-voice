import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useDashboard } from "@/components/dashboard/DashboardShell";
import { createFeatureRequestFn } from "@/lib/webhooks.functions";
import type { Tables } from "@/integrations/supabase/types";


type Feature = Tables<"feature_requests"> & { votes?: number };

const STATUSES = ["open", "planned", "in_progress", "done", "declined"] as const;

export const Route = createFileRoute("/_authenticated/dashboard/feature-requests")({
  component: FeatureRequestsPage,
});

function FeatureRequestsPage() {
  const { current } = useDashboard();
  const createFn = useServerFn(createFeatureRequestFn);
  const [items, setItems] = useState<Feature[]>([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");


  async function load() {
    if (!current) return setItems([]);
    const { data: rows } = await supabase.from("feature_requests")
      .select("*").eq("project_id", current.id).order("created_at", { ascending: false });
    const list = (rows ?? []) as Feature[];
    if (list.length) {
      const { data: votes } = await supabase.from("feature_votes")
        .select("feature_request_id").in("feature_request_id", list.map((x) => x.id));
      const counts: Record<string, number> = {};
      (votes ?? []).forEach((v: { feature_request_id: string }) => {
        counts[v.feature_request_id] = (counts[v.feature_request_id] ?? 0) + 1;
      });
      list.forEach((f) => (f.votes = counts[f.id] ?? 0));
      list.sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0));
    }
    setItems(list);
  }
  useEffect(() => { load(); }, [current?.id]);

  async function create() {
    if (!current || !title.trim()) return;
    await createFn({ data: { projectId: current.id, title: title.trim(), description: desc } });
    setTitle(""); setDesc(""); load();
  }

  async function setStatus(id: string, status: string) {
    await supabase.from("feature_requests").update({ status }).eq("id", id);
    load();
  }
  async function remove(id: string) {
    await supabase.from("feature_requests").delete().eq("id", id);
    load();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Feature Requests</h1>
          <p className="mt-1 text-sm text-muted-foreground">Ideas from your users. Update status to keep them in the loop.</p>
        </div>
        {current && (
          <a href={`/p/${current.slug}/roadmap`} target="_blank" rel="noreferrer"
            className="text-sm font-medium text-primary hover:underline">Public roadmap →</a>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Feature idea"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} placeholder="Details (optional)"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        <div className="flex justify-end">
          <button onClick={create} disabled={!current || !title.trim()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {items.length === 0 && <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No requests yet.</div>}
        {items.map((f) => (
          <div key={f.id} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
            <div className="grid w-14 shrink-0 place-items-center rounded-lg bg-muted py-2 text-sm font-semibold">{f.votes ?? 0}</div>
            <div className="min-w-0 flex-1">
              <div className="font-medium">{f.title}</div>
              {f.description && <p className="mt-1 text-sm text-muted-foreground">{f.description}</p>}
            </div>
            <select value={f.status} onChange={(e) => setStatus(f.id, e.target.value)}
              className="rounded-md border border-border bg-background px-2 py-1 text-xs">
              {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
            </select>
            <button onClick={() => remove(f.id)} className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
