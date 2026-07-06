import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { PublicShell } from "@/components/PublicShell";

type PublicData = {
  project: { id: string; name: string; slug: string } | null;
  changelog: Array<{ id: string; title: string; body: string; tag: string | null; published_at: string }>;
  features: Array<{ id: string; title: string; description: string; status: string; created_at: string; votes: number }>;
};

export const Route = createFileRoute("/p/$slug/changelog")({
  head: ({ params }) => {
    const url = `https://widget-voice.lovable.app/p/${params.slug}/changelog`;
    const title = `Changelog — ${params.slug}`;
    const desc = "Product updates and release notes.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [{
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: params.slug, item: `https://widget-voice.lovable.app/p/${params.slug}/roadmap` },
            { "@type": "ListItem", position: 2, name: "Changelog", item: url },
          ],
        }),
      }],
    };
  },
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
      setData((res as unknown as PublicData) ?? { project: null, changelog: [], features: [] });
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
