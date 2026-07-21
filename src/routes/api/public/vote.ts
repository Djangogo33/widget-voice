import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "content-type",
};

const Schema = z.object({
  feature_id: z.string().uuid(),
  voter_id: z.string().min(8).max(128),
});

export const Route = createFileRoute("/api/public/vote")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        let body: unknown;
        try { body = await request.json(); } catch {
          return new Response("bad json", { status: 400, headers: CORS });
        }
        const parsed = Schema.safeParse(body);
        if (!parsed.success) {
          return new Response(JSON.stringify({ error: "invalid" }), {
            status: 400, headers: { ...CORS, "content-type": "application/json" },
          });
        }
        const { checkRateLimit, getClientIp } = await import("@/lib/rate-limit.server");
        const ip = getClientIp(request);
        const [okVoter, okIp] = await Promise.all([
          checkRateLimit("vote:voter", parsed.data.voter_id, 20, 60),
          checkRateLimit("vote:ip", ip, 60, 60),
        ]);
        if (!okVoter || !okIp) {
          return new Response(JSON.stringify({ error: "rate_limited" }), {
            status: 429, headers: { ...CORS, "content-type": "application/json" },
          });
        }
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.rpc("cast_public_vote", {
          _feature_id: parsed.data.feature_id,
          _voter: parsed.data.voter_id,
        });
        if (error) {
          return new Response(JSON.stringify({ error: "vote_failed" }), {
            status: 500, headers: { ...CORS, "content-type": "application/json" },
          });
        }
        // Fire webhook (fire-and-forget); resolve project via feature
        try {
          const { data: feat } = await supabaseAdmin
            .from("feature_requests")
            .select("id, title, project_id")
            .eq("id", parsed.data.feature_id).maybeSingle();
          if (feat) {
            const { dispatchWebhooks } = await import("@/lib/webhooks.server");
            void dispatchWebhooks(feat.project_id, "feature_vote.created", {
              feature_id: feat.id, title: feat.title, votes: data ?? 0,
            });
          }
        } catch { /* ignore */ }
        return new Response(JSON.stringify({ votes: data ?? 0 }), {
          headers: { ...CORS, "content-type": "application/json" },
        });

      },
    },
  },
});
