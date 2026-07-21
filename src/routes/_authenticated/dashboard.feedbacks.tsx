import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { X, ImageIcon, Check, Inbox, Search, Download } from "lucide-react";
import { useDashboard } from "@/components/dashboard/DashboardShell";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Feedback = Tables<"feedbacks">;
type Filter = "all" | "open" | "resolved";
type TypeFilter = "all" | "idea" | "bug" | "question" | "other";

function typeBadgeClass(t: string) {
  switch (t) {
    case "bug": return "bg-red-100 text-red-700";
    case "idea": return "bg-violet-100 text-violet-700";
    case "question": return "bg-blue-100 text-blue-700";
    default: return "bg-gray-100 text-gray-600";
  }
}

function toCsv(rows: Feedback[]): string {
  const header = ["id","type","status","message","page_url","browser","created_at"];
  const esc = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push([r.id, r.type ?? "other", r.status, r.message, r.page_url ?? "", r.browser ?? "", r.created_at].map(esc).join(","));
  }
  return lines.join("\n");
}


export const Route = createFileRoute("/_authenticated/dashboard/feedbacks")({
  component: FeedbacksPage,
});

function FeedbacksPage() {
  const { current } = useDashboard();
  const [rows, setRows] = useState<Feedback[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    if (!current) { setRows([]); return; }
    setLoading(true);
    const { data } = await supabase
      .from("feedbacks")
      .select("*")
      .eq("project_id", current.id)
      .order("created_at", { ascending: false });
    setRows((data ?? []) as Feedback[]);
    setLoading(false);
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [current?.id]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter !== "all" && r.status !== filter) return false;
      if (typeFilter !== "all" && (r.type ?? "other") !== typeFilter) return false;
      if (q && !(r.message.toLowerCase().includes(q) || (r.page_url ?? "").toLowerCase().includes(q))) return false;
      return true;
    });
  }, [rows, filter, typeFilter, query]);

  function exportCsv() {
    const csv = toCsv(filtered);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `feedbacks-${current?.slug ?? "export"}-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }


  async function resolve(id: string) {
    await supabase.from("feedbacks").update({ status: "resolved" }).eq("id", id);
    setRows((rs) => rs.map((r) => r.id === id ? { ...r, status: "resolved" } : r));
    setSelected((s) => s && s.id === id ? { ...s, status: "resolved" } : s);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Feedbacks</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {current ? `From ${current.name}` : "Select a project"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="w-48 rounded-lg border border-border bg-background pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div className="inline-flex rounded-lg border border-border bg-card p-0.5">
            {(["all","idea","bug","question"] as TypeFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setTypeFilter(f)}
                className={`rounded-md px-2.5 py-1.5 text-xs font-medium capitalize transition ${
                  typeFilter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="inline-flex rounded-lg border border-border bg-card p-0.5">
            {(["all","open","resolved"] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition ${
                  filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {!current ? (
        <EmptyState title="No project selected" sub="Pick a project from the top bar." />
      ) : loading ? (
        <EmptyState title="Loading…" sub="" />
      ) : filtered.length === 0 ? (
        <EmptyState title="No feedback yet" sub="Install your widget snippet to start receiving feedback." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Preview</th>
                <th className="px-4 py-3 font-medium">Message</th>
                <th className="px-4 py-3 font-medium">Page</th>
                <th className="px-4 py-3 font-medium">Browser</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => setSelected(r)}
                  className="cursor-pointer border-b border-border/60 last:border-0 hover:bg-muted/40"
                >
                  <td className="px-4 py-3">
                    {r.screenshot_url ? (
                      <img src={r.screenshot_url} alt="" className="h-10 w-14 rounded object-cover" />
                    ) : (
                      <div className="grid h-10 w-14 place-items-center rounded bg-muted text-muted-foreground">
                        <ImageIcon className="h-4 w-4" />
                      </div>
                    )}
                  </td>
                  <td className="max-w-[24rem] truncate px-4 py-3">{r.message}</td>
                  <td className="max-w-[14rem] truncate px-4 py-3 text-muted-foreground">{r.page_url ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.browser ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setSelected(null)} />
          <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col overflow-y-auto border-l border-border bg-card p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <StatusBadge status={selected.status} />
                <h2 className="mt-2 text-lg font-semibold">Feedback detail</h2>
              </div>
              <button onClick={() => setSelected(null)} className="rounded-md p-1 text-muted-foreground hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>
            {selected.screenshot_url && (
              <img src={selected.screenshot_url} alt="" className="mt-4 w-full rounded-lg border border-border" />
            )}
            <div className="mt-4 space-y-3 text-sm">
              <Field label="Message" value={selected.message} />
              <Field label="Page URL" value={selected.page_url ?? "—"} />
              <Field label="Browser" value={selected.browser ?? "—"} />
              <Field label="Received" value={new Date(selected.created_at).toLocaleString()} />
            </div>
            {selected.status === "open" && (
              <button
                onClick={() => resolve(selected.id)}
                className="mt-6 inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                <Check className="h-4 w-4" /> Mark as resolved
              </button>
            )}
          </aside>
        </>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isOpen = status === "open";
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
        isOpen ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
      }`}
    >
      {isOpen ? "Open" : "Resolved"}
    </span>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-0.5 break-words">{value}</div>
    </div>
  );
}

function EmptyState({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
      <Inbox className="mx-auto h-6 w-6 text-muted-foreground" />
      <h3 className="mt-2 text-base font-semibold">{title}</h3>
      {sub && <p className="mt-1 text-sm text-muted-foreground">{sub}</p>}
    </div>
  );
}
