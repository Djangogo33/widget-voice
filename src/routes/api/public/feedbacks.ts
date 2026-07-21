import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { checkRateLimit, getClientIp, isDuplicateFeedback } from "@/lib/rate-limit.server";

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "content-type",
};

const Schema = z.object({
  widget_key: z.string().min(8).max(128),
  message: z.string().trim().min(3).max(5000),
  type: z.enum(["idea", "bug", "question", "other"]).optional(),
  email: z.string().email().max(255).nullable().optional(),
  page_url: z.string().max(2000).optional(),
  user_agent: z.string().max(500).optional(),
  screenshot: z.string().max(5_000_000).nullable().optional(),
  hp: z.string().max(200).optional(), // honeypot
});

function parseBrowser(ua?: string): string {
  if (!ua) return "unknown";
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/Edg\//.test(ua)) return "Edge";
  if (/Chrome\//.test(ua)) return "Chrome";
  if (/Safari\//.test(ua)) return "Safari";
  return "Other";
}

function detectTypeFromMessage(msg: string): "idea" | "bug" | "question" | "other" {
  const m = msg.match(/^\[(idea|bug|question)\]/i);
  return m ? (m[1].toLowerCase() as "idea" | "bug" | "question") : "other";
}

const jsonHeaders = { ...CORS, "content-type": "application/json" };

export const Route = createFileRoute("/api/public/feedbacks")({
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
          return new Response(JSON.stringify({ error: "invalid" }), { status: 400, headers: jsonHeaders });
        }
        const d = parsed.data;

        // Honeypot: silently accept
        if (d.hp && d.hp.length > 0) {
          return new Response(JSON.stringify({ ok: true }), { headers: jsonHeaders });
        }

        // Rate limit: 10 feedbacks per widget_key per minute + 30 per IP per minute
        const ip = getClientIp(request);
        const [okKey, okIp] = await Promise.all([
          checkRateLimit("feedback:key", d.widget_key, 10, 60),
          checkRateLimit("feedback:ip", ip, 30, 60),
        ]);
        if (!okKey || !okIp) {
          return new Response(JSON.stringify({ error: "rate_limited" }), { status: 429, headers: jsonHeaders });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: proj, error: projErr } = await supabaseAdmin
          .from("projects").select("id").eq("widget_key", d.widget_key).maybeSingle();
        if (projErr || !proj) {
          return new Response(JSON.stringify({ error: "invalid_key" }), { status: 404, headers: jsonHeaders });
        }

        const msg = d.email ? `${d.message}\n\n— ${d.email}` : d.message;

        // Anti-spam: block identical message within 60s
        if (await isDuplicateFeedback(proj.id, msg, 60)) {
          return new Response(JSON.stringify({ ok: true, deduped: true }), { headers: jsonHeaders });
        }

        let screenshotUrl: string | null = null;
        if (d.screenshot && d.screenshot.startsWith("data:image/")) {
          try {
            const m = d.screenshot.match(/^data:(image\/\w+);base64,(.+)$/);
            if (m) {
              const [, mime, b64] = m;
              const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
              const ext = mime === "image/png" ? "png" : "jpg";
              const path = `${proj.id}/${crypto.randomUUID()}.${ext}`;
              const up = await supabaseAdmin.storage
                .from("feedback-screenshots")
                .upload(path, bytes, { contentType: mime, upsert: false });
              if (!up.error) screenshotUrl = path;
            }
          } catch { /* ignore */ }
        }

        const finalType = d.type ?? detectTypeFromMessage(d.message);
        const { data: inserted, error: insErr } = await supabaseAdmin.from("feedbacks").insert({
          project_id: proj.id,
          message: msg,
          type: finalType,
          page_url: d.page_url ?? null,
          browser: parseBrowser(d.user_agent),
          screenshot_url: screenshotUrl,
        }).select("id").single();
        if (insErr) {
          return new Response(JSON.stringify({ error: "insert_failed" }), { status: 500, headers: jsonHeaders });
        }
        const { dispatchWebhooks } = await import("@/lib/webhooks.server");
        void dispatchWebhooks(proj.id, "feedback.created", {
          id: inserted.id,
          message: msg,
          type: finalType,
          page_url: d.page_url ?? null,
          browser: parseBrowser(d.user_agent),
          screenshot_url: screenshotUrl,
        });
        return new Response(JSON.stringify({ ok: true }), { headers: jsonHeaders });
      },
    },
  },
});
