import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";

type PublicData = {
  project: { id: string; name: string; slug: string } | null;
  changelog: Array<{ id: string; title: string; body: string; tag: string | null; published_at: string }>;
  features: Array<{ id: string; title: string; description: string; status: string; created_at: string; votes: number }>;
};

export const Route = createFileRoute("/p/$slug/changelog")({
  head: () => ({
    meta: [
      { title: "Changelog" },
      { name: "description", content: "Product updates and release notes." },
      { property: "og:title", content: "Changelog" },
    ],
  }),
  component: PublicChangelog,
});

function PublicChangelog() {
  const { slug } = Route.useParams();
  const { lang } = useI18n();
  const fr = lang === "fr";
  const [data, setData] = useState<PublicData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: res } = await supabase.rpc("get_public_project", { _slug: slug });
      setData((res as PublicData) ?? { project: null, changelog: [], features: [] });
      setLoading(false);
    })();
  }, [slug]);

  if (loading) return <PublicShell><div className="py-24 text-center text-sm text-muted-foreground">…</div></PublicShell>;
  if (!data?.project) return <PublicShell><div className="py-24 text-center text-sm text-muted-foreground">{fr ? "Projet introuvable." : "Project not found."}</div></PublicShell>;

  return (
    <PublicShell projectName={data.project.name} slug={slug} active="changelog">
      <h1 className="text-3xl font-bold tracking-tight">{fr ? "Nouveautés" : "Changelog"}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {fr ? "Les dernières mises à jour de " : "Latest updates from "}
        <span className="font-medium text-foreground">{data.project.name}</span>.
      </p>
      <div className="mt-10 space-y-8">
        {data.changelog.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            {fr ? "Rien de publié pour le moment." : "Nothing published yet."}
          </div>
        )}
        {data.changelog.map((c) => (
          <article key={c.id} className="border-l-2 border-primary/30 pl-5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <time>{new Date(c.published_at).toLocaleDateString(fr ? "fr-FR" : "en-US", { year: "numeric", month: "long", day: "numeric" })}</time>
              {c.tag && <span className="rounded-md bg-primary/10 px-2 py-0.5 font-medium text-primary">{c.tag}</span>}
            </div>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">{c.title}</h2>
            {c.body && <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{c.body}</p>}
          </article>
        ))}
      </div>
    </PublicShell>
  );
}

function PublicShell({
  children, projectName, slug, active,
}: {
  children: React.ReactNode;
  projectName?: string;
  slug?: string;
  active?: "changelog" | "roadmap";
}) {
  const { lang } = useI18n();
  const fr = lang === "fr";
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground">
              <MessageSquare className="h-3.5 w-3.5" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-semibold">{projectName ?? "WidgetVoice"}</span>
          </div>
          {slug && (
            <nav className="flex gap-1 text-xs">
              <Link to="/p/$slug/changelog" params={{ slug }}
                className={`rounded-md px-3 py-1.5 font-medium ${active === "changelog" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                {fr ? "Nouveautés" : "Changelog"}
              </Link>
              <Link to="/p/$slug/roadmap" params={{ slug }}
                className={`rounded-md px-3 py-1.5 font-medium ${active === "roadmap" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                {fr ? "Feuille de route" : "Roadmap"}
              </Link>
            </nav>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-12">{children}</main>
      <footer className="mx-auto max-w-3xl px-6 pb-10 text-center text-xs text-muted-foreground">
        {fr ? "Propulsé par " : "Powered by "}
        <Link to="/" className="font-medium text-foreground hover:underline">WidgetVoice</Link>
      </footer>
    </div>
  );
}

export { PublicShell };
