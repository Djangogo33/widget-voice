import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { PublicShell } from "@/components/PublicShell";

type PublicData = {
  project: { id: string; name: string; slug: string } | null;
  changelog: unknown[];
  features: Array<{ id: string; title: string; description: string; status: string; created_at: string; votes: number }>;
};

const STATUS_ORDER = ["open", "planned", "in_progress", "done", "declined"] as const;

export const Route = createFileRoute("/p/$slug/roadmap")({
  head: () => ({
    meta: [
      { title: "Roadmap" },
      { name: "description", content: "What we're building next — vote on ideas." },
      { property: "og:title", content: "Roadmap" },
    ],
  }),
  component: PublicRoadmap,
});

function getVoterId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("wv_voter");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("wv_voter", id);
  }
  return id;
}

function PublicRoadmap() {
  const { slug } = Route.useParams();
  const { lang } = useI18n();
  const fr = lang === "fr";
  const [data, setData] = useState<PublicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [voted, setVoted] = useState<Record<string, number>>({});

  useEffect(() => {
    (async () => {
      const { data: res } = await supabase.rpc("get_public_project", { _slug: slug });
      setData((res as unknown as PublicData) ?? { project: null, changelog: [], features: [] });
      setLoading(false);
      try {
        const stored = JSON.parse(localStorage.getItem("wv_voted") || "{}");
        setVoted(stored);
      } catch { /* noop */ }
    })();
  }, [slug]);

  const grouped = useMemo(() => {
    const g: Record<string, PublicData["features"]> = {};
    for (const s of STATUS_ORDER) g[s] = [];
    (data?.features ?? []).forEach((f) => { (g[f.status] ??= []).push(f); });
    return g;
  }, [data]);

  async function vote(id: string) {
    if (voted[id]) return;
    const voter_id = getVoterId();
    const res = await fetch("/api/public/vote", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ feature_id: id, voter_id }),
    });
    if (!res.ok) return;
    const { votes } = await res.json();
    const next = { ...voted, [id]: votes };
    setVoted(next);
    localStorage.setItem("wv_voted", JSON.stringify(next));
    setData((prev) => prev ? {
      ...prev,
      features: prev.features.map((f) => f.id === id ? { ...f, votes } : f),
    } : prev);
  }

  const statusLabel = (s: string) => {
    const map: Record<string, [string, string]> = {
      open: ["Suggestions", "Suggestions"],
      planned: ["Planned", "Planifié"],
      in_progress: ["In progress", "En cours"],
      done: ["Shipped", "Livré"],
      declined: ["Declined", "Refusé"],
    };
    const p = map[s] ?? [s, s];
    return fr ? p[1] : p[0];
  };

  if (loading) return <PublicShell><div className="py-24 text-center text-sm text-muted-foreground">…</div></PublicShell>;
  if (!data?.project) return <PublicShell><div className="py-24 text-center text-sm text-muted-foreground">{fr ? "Projet introuvable." : "Project not found."}</div></PublicShell>;

  return (
    <PublicShell projectName={data.project.name} slug={slug} active="roadmap">
      <h1 className="text-3xl font-bold tracking-tight">{fr ? "Feuille de route" : "Roadmap"}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {fr ? "Votez pour ce que nous devrions construire ensuite." : "Vote for what we should build next."}
      </p>
      <div className="mt-10 space-y-10">
        {STATUS_ORDER.map((s) => grouped[s].length > 0 && (
          <section key={s}>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{statusLabel(s)}</h2>
            <ul className="space-y-2">
              {grouped[s].map((f) => (
                <li key={f.id} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
                  <button
                    onClick={() => vote(f.id)}
                    disabled={!!voted[f.id]}
                    className={`flex w-14 shrink-0 flex-col items-center rounded-lg border py-2 text-xs font-semibold transition ${
                      voted[f.id]
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary hover:text-primary"
                    }`}
                    aria-label="Vote"
                  >
                    <ChevronUp className="h-4 w-4" />
                    <span className="mt-0.5">{f.votes}</span>
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{f.title}</div>
                    {f.description && <p className="mt-1 text-sm text-muted-foreground">{f.description}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
        {(data.features ?? []).length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            {fr ? "Aucune idée pour le moment." : "No ideas yet."}
          </div>
        )}
      </div>
    </PublicShell>
  );
}
