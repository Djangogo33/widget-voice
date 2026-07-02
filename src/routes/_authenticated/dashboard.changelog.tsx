import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useDashboard } from "@/components/dashboard/DashboardShell";
import { publishChangelogEntryFn } from "@/lib/webhooks.functions";
import type { Tables } from "@/integrations/supabase/types";


type Entry = Tables<"changelog_entries">;

export const Route = createFileRoute("/_authenticated/dashboard/changelog")({
  component: ChangelogPage,
});

function ChangelogPage() {
  const { current } = useDashboard();
  const publishFn = useServerFn(publishChangelogEntryFn);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tag, setTag] = useState("");
  const [busy, setBusy] = useState(false);


  async function load() {
    if (!current) return setEntries([]);
    const { data } = await supabase.from("changelog_entries")
      .select("*").eq("project_id", current.id)
      .order("published_at", { ascending: false });
    setEntries((data ?? []) as Entry[]);
  }
  useEffect(() => { load(); }, [current?.id]);

  async function create() {
    if (!current || !title.trim()) return;
    setBusy(true);
    try {
      await publishFn({ data: { projectId: current.id, title: title.trim(), body, tag: tag.trim() || null } });
    } finally { setBusy(false); }
    setTitle(""); setBody(""); setTag(""); load();
  }

  async function toggle(e: Entry) {
    await supabase.from("changelog_entries").update({ published: !e.published }).eq("id", e.id);
    load();
  }
  async function remove(id: string) {
    await supabase.from("changelog_entries").delete().eq("id", id);
    load();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Changelog</h1>
          <p className="mt-1 text-sm text-muted-foreground">Publish updates for {current?.name ?? "your project"}.</p>
        </div>
        {current && (
          <a href={`/p/${current.slug}/changelog`} target="_blank" rel="noreferrer"
            className="text-sm font-medium text-primary hover:underline">View public page →</a>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <div className="flex gap-2">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title"
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          <input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="Tag (New, Fix…)"
            className="w-40 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        </div>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} placeholder="What changed?"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        <div className="flex justify-end">
          <button onClick={create} disabled={busy || !current || !title.trim()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">
            <Plus className="h-4 w-4" /> Publish
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {entries.length === 0 && <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No entries yet.</div>}
        {entries.map((e) => (
          <div key={e.id} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <time>{new Date(e.published_at).toLocaleDateString()}</time>
                  {e.tag && <span className="rounded-md bg-primary/10 px-1.5 py-0.5 font-medium text-primary">{e.tag}</span>}
                  {!e.published && <span className="rounded-md bg-muted px-1.5 py-0.5">draft</span>}
                </div>
                <h3 className="mt-1 text-base font-semibold">{e.title}</h3>
                {e.body && <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{e.body}</p>}
              </div>
              <div className="flex gap-1">
                <button onClick={() => toggle(e)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" title={e.published ? "Unpublish" : "Publish"}>
                  {e.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <button onClick={() => remove(e.id)} className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
