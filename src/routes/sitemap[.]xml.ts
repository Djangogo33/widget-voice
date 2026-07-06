import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://widget-voice.lovable.app";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/login", changefreq: "monthly", priority: "0.3" },
          { path: "/signup", changefreq: "monthly", priority: "0.5" },
          { path: "/legal/cgu", changefreq: "yearly", priority: "0.2" },
          { path: "/legal/privacy", changefreq: "yearly", priority: "0.2" },
          { path: "/legal/cookies", changefreq: "yearly", priority: "0.2" },
          { path: "/legal/mentions-legales", changefreq: "yearly", priority: "0.2" },
          { path: "/legal/terms-of-sale", changefreq: "yearly", priority: "0.2" },
        ];

        try {
          const { createClient } = await import("@supabase/supabase-js");
          const url = process.env.SUPABASE_URL;
          const key = process.env.SUPABASE_PUBLISHABLE_KEY;
          if (url && key) {
            const sb = createClient(url, key, {
              auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
            });
            const { data: projects } = await sb.rpc("get_public_project", { _slug: "__none__" });
            void projects; // no-op, just to keep type
            // Public project slugs live in projects table — expose via a broader query when a public policy exists.
            // For now, we don't enumerate projects here to avoid leaking private slugs.
          }
        } catch { /* ignore */ }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ].filter(Boolean).join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
