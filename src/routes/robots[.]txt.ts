import { createFileRoute } from "@tanstack/react-router";

const BODY = `User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /api/

Sitemap: https://widget-voice.lovable.app/sitemap.xml
`;

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async () =>
        new Response(BODY, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=86400",
          },
        }),
    },
  },
});
