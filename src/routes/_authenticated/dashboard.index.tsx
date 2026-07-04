import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Inbox, Lightbulb, ThumbsUp, Megaphone, ArrowRight, Check,
  Rocket, Code2, MessageSquare, Sparkles, Copy,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useDashboard } from "@/components/dashboard/DashboardShell";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: OverviewPage,
});

type Stats = {
  feedbacks: number;
  features: number;
  votes: number;
  changelog: number;
  hasFeedback: boolean;
  hasFeature: boolean;
  hasChangelog: boolean;
  hasVote: boolean;
  daily: { date: string; count: number }[];
};

function OverviewPage() {
  const { projects, current } = useDashboard();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const ids = projects.map((p) => p.id);
      if (ids.length === 0) {
        if (alive) { setStats(emptyStats()); setLoading(false); }
        return;
      }
      const since = new Date(Date.now() - 30 * 86400_000).toISOString();
      const [fbAll, fb30, feat, chg] = await Promise.all([
        supabase.from("feedbacks").select("id", { count: "exact", head: true }).in("project_id", ids),
        supabase.from("feedbacks").select("created_at").in("project_id", ids).gte("created_at", since),
        supabase.from("feature_requests").select("id").in("project_id", ids),
        supabase.from("changelog_entries").select("id", { count: "exact", head: true }).in("project_id", ids).eq("published", true),
      ]);
      const featIds = (feat.data ?? []).map((r: { id: string }) => r.id);
      const votes = featIds.length
        ? await supabase.from("feature_votes").select("id", { count: "exact", head: true }).in("feature_request_id", featIds)
        : { count: 0 } as { count: number };

      const rows = (fb30.data ?? []) as { created_at: string }[];
      const buckets = new Map<string, number>();
      for (let i = 29; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400_000).toISOString().slice(0, 10);
        buckets.set(d, 0);
      }
      for (const r of rows) {
        const d = r.created_at.slice(0, 10);
        if (buckets.has(d)) buckets.set(d, (buckets.get(d) ?? 0) + 1);
      }
      const daily = Array.from(buckets.entries()).map(([date, count]) => ({ date, count }));

      if (!alive) return;
      setStats({
        feedbacks: fbAll.count ?? 0,
        features: featIds.length,
        votes: votes.count ?? 0,
        changelog: chg.count ?? 0,
        hasFeedback: (fbAll.count ?? 0) > 0,
        hasFeature: featIds.length > 0,
        hasChangelog: (chg.count ?? 0) > 0,
        hasVote: (votes.count ?? 0) > 0,
        daily,
      });
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [projects]);

  const snippet = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const key = current?.widget_key ?? "YOUR_KEY";
    return `<script src="${origin}/api/public/widget.js" data-key="${key}" async></script>`;
  }, [current]);

  function copySnippet() {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const checklist = [
    { done: projects.length > 0, label: "Créer un projet", to: "/dashboard/projects" },
    { done: stats?.hasFeedback ?? false, label: "Recevoir un premier feedback", to: "/dashboard/feedbacks" },
    { done: stats?.hasFeature ?? false, label: "Ajouter une feature request", to: "/dashboard/feature-requests" },
    { done: stats?.hasVote ?? false, label: "Récolter un premier vote", to: "/dashboard/feature-requests" },
    { done: stats?.hasChangelog ?? false, label: "Publier une entrée changelog", to: "/dashboard/changelog" },
  ];
  const doneCount = checklist.filter((c) => c.done).length;
  const total = checklist.length;
  const pct = Math.round((doneCount / total) * 100);
  const complete = doneCount === total;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Vue d'ensemble</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {projects.length === 0
            ? "Bienvenue — commencez par créer votre premier projet."
            : `Activité des 30 derniers jours sur ${projects.length} projet${projects.length > 1 ? "s" : ""}.`}
        </p>
      </div>

      {/* Onboarding checklist */}
      {!complete && (
        <section className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex flex-col gap-4 border-b border-border bg-gradient-to-br from-primary/5 to-transparent p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <Rocket className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Démarrez avec WidgetVoice</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {doneCount} / {total} étapes complétées
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-40 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-primary">{pct}%</span>
            </div>
          </div>
          <ul className="divide-y divide-border">
            {checklist.map((c) => (
              <li key={c.label}>
                <Link
                  to={c.to}
                  className="flex items-center gap-3 px-6 py-3.5 text-sm transition hover:bg-muted/50"
                >
                  <span
                    className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border ${
                      c.done
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    {c.done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : null}
                  </span>
                  <span className={c.done ? "text-muted-foreground line-through" : "font-medium"}>
                    {c.label}
                  </span>
                  <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {complete && (
        <section className="flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-5">
          <Sparkles className="h-5 w-5 text-primary" />
          <div className="text-sm">
            <span className="font-semibold">Bien joué !</span>{" "}
            <span className="text-muted-foreground">Votre boucle de feedback tourne.</span>
          </div>
        </section>
      )}

      {/* KPIs */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Feedbacks" value={stats?.feedbacks ?? 0} icon={Inbox} loading={loading} />
        <Kpi label="Feature requests" value={stats?.features ?? 0} icon={Lightbulb} loading={loading} />
        <Kpi label="Votes" value={stats?.votes ?? 0} icon={ThumbsUp} loading={loading} />
        <Kpi label="Changelog publié" value={stats?.changelog ?? 0} icon={Megaphone} loading={loading} />
      </section>

      {/* Sparkline + snippet */}
      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Feedbacks · 30 derniers jours</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {(stats?.daily ?? []).reduce((s, d) => s + d.count, 0)} au total sur la période
              </p>
            </div>
            <Link
              to="/dashboard/feedbacks"
              className="text-xs font-medium text-primary hover:underline"
            >
              Voir tout →
            </Link>
          </div>
          <Sparkline data={stats?.daily ?? []} />
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <Code2 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold">Snippet du widget</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Collez cette balise dans le <code className="rounded bg-muted px-1">{"<head>"}</code> de votre site.
              </p>
            </div>
          </div>
          <div className="mt-4 rounded-lg bg-muted/60 p-3 font-mono text-[11px] leading-relaxed text-foreground/80">
            <div className="max-h-24 overflow-auto break-all">{snippet}</div>
          </div>
          <button
            onClick={copySnippet}
            disabled={!current}
            className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copié !" : "Copier le snippet"}
          </button>
        </div>
      </section>

      {/* Quick links */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <QuickLink
          to="/dashboard/feedbacks"
          icon={MessageSquare}
          title="Boîte de feedbacks"
          desc="Triez, répondez, classez ce que vos utilisateurs remontent."
        />
        <QuickLink
          to="/dashboard/feature-requests"
          icon={Lightbulb}
          title="Roadmap publique"
          desc="Laissez vos utilisateurs voter sur les prochaines features."
        />
        <QuickLink
          to="/dashboard/changelog"
          icon={Megaphone}
          title="Changelog"
          desc="Annoncez les nouveautés sur une page publique dédiée."
        />
      </section>
    </div>
  );
}

function emptyStats(): Stats {
  const daily = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 86400_000).toISOString().slice(0, 10),
    count: 0,
  }));
  return {
    feedbacks: 0, features: 0, votes: 0, changelog: 0,
    hasFeedback: false, hasFeature: false, hasChangelog: false, hasVote: false,
    daily,
  };
}

function Kpi({
  label, value, icon: Icon, loading,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  loading: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-3 text-3xl font-bold tracking-tight">
        {loading ? <span className="text-muted-foreground/40">—</span> : value.toLocaleString("fr-FR")}
      </div>
    </div>
  );
}

function Sparkline({ data }: { data: { date: string; count: number }[] }) {
  const w = 600;
  const h = 120;
  const pad = 4;
  const max = Math.max(1, ...data.map((d) => d.count));
  const step = data.length > 1 ? (w - pad * 2) / (data.length - 1) : 0;
  const points = data.map((d, i) => {
    const x = pad + i * step;
    const y = h - pad - (d.count / max) * (h - pad * 2);
    return `${x},${y}`;
  }).join(" ");
  const area = `${pad},${h - pad} ${points} ${w - pad},${h - pad}`;

  return (
    <div className="mt-4">
      <svg viewBox={`0 0 ${w} ${h}`} className="h-32 w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="sparkFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.25" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#sparkFill)" className="text-primary" />
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          className="text-primary"
        />
      </svg>
      <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
        <span>{fmtDate(data[0]?.date)}</span>
        <span>{fmtDate(data[Math.floor(data.length / 2)]?.date)}</span>
        <span>{fmtDate(data[data.length - 1]?.date)}</span>
      </div>
    </div>
  );
}

function fmtDate(d?: string) {
  if (!d) return "";
  const dt = new Date(d);
  return dt.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function QuickLink({
  to, icon: Icon, title, desc,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <Link
      to={to}
      className="group flex flex-col gap-2 rounded-2xl border border-border bg-card p-5 transition hover:border-primary/40 hover:shadow-md hover:shadow-primary/5"
    >
      <div className="flex items-center gap-2">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">{desc}</p>
      <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition group-hover:opacity-100">
        Ouvrir <ArrowRight className="h-3 w-3" />
      </span>
    </Link>
  );
}
