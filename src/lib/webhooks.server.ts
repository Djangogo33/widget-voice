// Server-only helper to dispatch webhooks. Never import from client bundles.
import { createHmac } from "node:crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type WebhookEvent =
  | "feedback.created"
  | "feature_request.created"
  | "feature_vote.created"
  | "changelog.published"
  | "webhook.test";

type ProjectLite = { id: string; name: string; slug: string | null };

const DISCORD_RE = /^https:\/\/(?:ptb\.|canary\.)?discord(?:app)?\.com\/api\/webhooks\//i;
const EVENT_COLOR: Record<WebhookEvent, number> = {
  "feedback.created": 0xf59e0b,
  "feature_request.created": 0x3b82f6,
  "feature_vote.created": 0x8b5cf6,
  "changelog.published": 0x10b981,
  "webhook.test": 0x64748b,
};
const EVENT_TITLE: Record<WebhookEvent, string> = {
  "feedback.created": "New feedback",
  "feature_request.created": "New feature request",
  "feature_vote.created": "New vote",
  "changelog.published": "Changelog published",
  "webhook.test": "Test delivery",
};

function truncate(v: unknown, max = 1500): string {
  const s = typeof v === "string" ? v : JSON.stringify(v ?? "");
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

function buildDiscordPayload(event: WebhookEvent, project: ProjectLite, data: Record<string, unknown>) {
  const fields: { name: string; value: string; inline?: boolean }[] = [];
  if (event === "feedback.created") {
    if (data.page_url) fields.push({ name: "Page", value: truncate(data.page_url, 200) });
    if (data.browser) fields.push({ name: "Browser", value: String(data.browser), inline: true });
  }
  if (event === "feature_vote.created" && typeof data.votes === "number") {
    fields.push({ name: "Votes", value: String(data.votes), inline: true });
  }
  if (event === "changelog.published" && data.tag) {
    fields.push({ name: "Tag", value: String(data.tag), inline: true });
  }
  const description =
    typeof data.message === "string" ? data.message
    : typeof data.title === "string" ? data.title
    : typeof data.body === "string" ? data.body
    : "—";
  return {
    username: `WidgetVoice · ${project.name}`,
    embeds: [{
      title: EVENT_TITLE[event],
      description: truncate(description, 1800),
      color: EVENT_COLOR[event],
      fields,
      timestamp: new Date().toISOString(),
      footer: { text: project.name },
    }],
  };
}

async function deliverOne(
  webhook: { id: string; url: string; secret: string },
  event: WebhookEvent,
  project: ProjectLite,
  data: Record<string, unknown>,
) {
  const deliveryId = crypto.randomUUID();
  const isDiscord = DISCORD_RE.test(webhook.url);
  const body = isDiscord
    ? JSON.stringify(buildDiscordPayload(event, project, data))
    : JSON.stringify({
        id: deliveryId,
        event,
        project: { id: project.id, name: project.name, slug: project.slug },
        data,
        created_at: new Date().toISOString(),
      });
  const signature = "sha256=" + createHmac("sha256", webhook.secret).update(body).digest("hex");
  const started = Date.now();
  let status = 0;
  let ok = false;
  let errorMsg: string | null = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    try {
      const res = await fetch(webhook.url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "user-agent": "WidgetVoice-Webhook/1.0",
          "x-widgetvoice-event": event,
          "x-widgetvoice-delivery": deliveryId,
          "x-widgetvoice-signature": signature,
        },
        body,
        signal: controller.signal,
      });
      status = res.status;
      ok = res.ok;
      if (!ok) errorMsg = `HTTP ${res.status}`;
      if (ok || res.status < 500) break;
    } catch (e) {
      errorMsg = e instanceof Error ? e.message : "network error";
    } finally {
      clearTimeout(timer);
    }
  }

  const duration = Date.now() - started;

  await supabaseAdmin.from("webhook_deliveries").insert({
    webhook_id: webhook.id,
    event,
    ok,
    status_code: status || null,
    error: errorMsg,
    duration_ms: duration,
    payload: JSON.parse(body),
  });

  if (ok) {
    await supabaseAdmin.from("webhooks").update({
      last_success_at: new Date().toISOString(),
      failure_count: 0,
      last_error_message: null,
    }).eq("id", webhook.id);
  } else {
    // Increment failure_count via RPC-less pattern: read then write.
    const { data: cur } = await supabaseAdmin
      .from("webhooks").select("failure_count").eq("id", webhook.id).maybeSingle();
    await supabaseAdmin.from("webhooks").update({
      last_error_at: new Date().toISOString(),
      last_error_message: errorMsg,
      failure_count: (cur?.failure_count ?? 0) + 1,
    }).eq("id", webhook.id);
  }

  return { ok, status, error: errorMsg, duration };
}

export async function dispatchWebhooks(
  projectId: string,
  event: WebhookEvent,
  data: Record<string, unknown>,
): Promise<void> {
  try {
    const { data: project } = await supabaseAdmin
      .from("projects").select("id, name, slug").eq("id", projectId).maybeSingle();
    if (!project) return;

    const { data: hooks } = await supabaseAdmin
      .from("webhooks")
      .select("id, url, secret, events, active")
      .eq("project_id", projectId)
      .eq("active", true);

    const targets = (hooks ?? []).filter((h) => Array.isArray(h.events) && h.events.includes(event));
    if (targets.length === 0) return;

    await Promise.all(targets.map((h) =>
      deliverOne({ id: h.id, url: h.url, secret: h.secret }, event, project as ProjectLite, data),
    ));
  } catch (e) {
    console.error("[webhooks] dispatch failed", e);
  }
}

export async function sendTestDelivery(webhookId: string): Promise<{ ok: boolean; status: number; error: string | null }> {
  const { data: webhook } = await supabaseAdmin
    .from("webhooks").select("id, url, secret, project_id").eq("id", webhookId).maybeSingle();
  if (!webhook) return { ok: false, status: 0, error: "not_found" };
  const { data: project } = await supabaseAdmin
    .from("projects").select("id, name, slug").eq("id", webhook.project_id).maybeSingle();
  if (!project) return { ok: false, status: 0, error: "project_missing" };
  const res = await deliverOne(
    { id: webhook.id, url: webhook.url, secret: webhook.secret },
    "webhook.test",
    project as ProjectLite,
    { message: "This is a test delivery from WidgetVoice." },
  );
  return { ok: res.ok, status: res.status, error: res.error };
}
