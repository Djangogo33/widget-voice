import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "content-type",
};

const Schema = z.object({
  widget_key: z.string().min(8).max(128),
  message: z.string().trim().min(1).max(5000),
  email: z.string().email().max(255).nullable().optional(),
  page_url: z.string().max(2000).optional(),
  user_agent: z.string().max(500).optional(),
  screenshot: z.string().max(5_000_000).nullable().optional(),
});

function parseBrowser(ua?: string): string {
  if (!ua) return "unknown";
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/Edg\//.test(ua)) return "Edge";
  if (/Chrome\//.test(ua)) return "Chrome";
  if (/Safari\//.test(ua)) return "Safari";
  return "Other";
}

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
          return new Response(JSON.stringify({ error: "invalid" }), {
            status: 400, headers: { ...CORS, "content-type": "application/json" },
          });
        }
        const d = parsed.data;
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // Resolve project
        const { data: proj, error: projErr } = await supabaseAdmin
          .from("projects").select("id").eq("widget_key", d.widget_key).maybeSingle();
        if (projErr || !proj) {
          return new Response(JSON.stringify({ error: "invalid_key" }), {
            status: 404, headers: { ...CORS, "content-type": "application/json" },
          });
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

        const msg = d.email ? `${d.message}\n\n— ${d.email}` : d.message;
        const { data: inserted, error: insErr } = await supabaseAdmin.from("feedbacks").insert({
          project_id: proj.id,
          message: msg,
          page_url: d.page_url ?? null,
          browser: parseBrowser(d.user_agent),
          screenshot_url: screenshotUrl,
        }).select("id").single();
        if (insErr) {
          return new Response(JSON.stringify({ error: "insert_failed" }), {
            status: 500, headers: { ...CORS, "content-type": "application/json" },
          });
        }
        const { dispatchWebhooks } = await import("@/lib/webhooks.server");
        void dispatchWebhooks(proj.id, "feedback.created", {
          id: inserted.id,
          message: msg,
          page_url: d.page_url ?? null,
          browser: parseBrowser(d.user_agent),
          screenshot_url: screenshotUrl,
        });
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...CORS, "content-type": "application/json" },
        });

      },
    },
  },
});
