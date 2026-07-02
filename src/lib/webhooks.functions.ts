import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ALL_EVENTS = [
  "feedback.created",
  "feature_request.created",
  "feature_vote.created",
  "changelog.published",
] as const;

function generateSecret(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return "whsec_" + Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function assertProjectOwner(supabase: any, projectId: string, userId: string) {
  const { data, error } = await supabase
    .from("projects").select("id").eq("id", projectId).eq("user_id", userId).maybeSingle();
  if (error || !data) throw new Error("Forbidden");
}

async function assertWebhookOwner(supabase: any, webhookId: string, userId: string) {
  const { data, error } = await supabase
    .from("webhooks").select("id, project_id, projects:project_id (user_id)")
    .eq("id", webhookId).maybeSingle();
  if (error || !data) throw new Error("not_found");
  const owner = (data as any).projects?.user_id;
  if (owner !== userId) throw new Error("Forbidden");
  return data as { id: string; project_id: string };
}

export const listWebhooks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { projectId: string }) => z.object({ projectId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertProjectOwner(context.supabase, data.projectId, context.userId);
    const { data: rows, error } = await context.supabase
      .from("webhooks")
      .select("id, name, url, events, active, secret, last_success_at, last_error_at, last_error_message, failure_count, created_at")
      .eq("project_id", data.projectId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const createWebhook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    projectId: z.string().uuid(),
    name: z.string().trim().min(1).max(80),
    url: z.string().url().max(2000).refine((u) => u.startsWith("https://"), "https required"),
    events: z.array(z.enum(ALL_EVENTS)).min(1),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await assertProjectOwner(context.supabase, data.projectId, context.userId);
    const { data: row, error } = await context.supabase.from("webhooks").insert({
      project_id: data.projectId,
      name: data.name,
      url: data.url,
      events: data.events,
      secret: generateSecret(),
    }).select("id").single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const updateWebhook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    id: z.string().uuid(),
    name: z.string().trim().min(1).max(80).optional(),
    url: z.string().url().max(2000).refine((u) => u.startsWith("https://"), "https required").optional(),
    events: z.array(z.enum(ALL_EVENTS)).min(1).optional(),
    active: z.boolean().optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await assertWebhookOwner(context.supabase, data.id, context.userId);
    const patch: Record<string, unknown> = {};
    if (data.name !== undefined) patch.name = data.name;
    if (data.url !== undefined) patch.url = data.url;
    if (data.events !== undefined) patch.events = data.events;
    if (data.active !== undefined) patch.active = data.active;
    const { error } = await context.supabase.from("webhooks").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteWebhook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertWebhookOwner(context.supabase, data.id, context.userId);
    const { error } = await context.supabase.from("webhooks").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const rotateWebhookSecret = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertWebhookOwner(context.supabase, data.id, context.userId);
    const secret = generateSecret();
    const { error } = await context.supabase.from("webhooks").update({ secret }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { secret };
  });

export const sendTestWebhook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertWebhookOwner(context.supabase, data.id, context.userId);
    const { sendTestDelivery } = await import("@/lib/webhooks.server");
    return await sendTestDelivery(data.id);
  });

export const listRecentDeliveries = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ webhookId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertWebhookOwner(context.supabase, data.webhookId, context.userId);
    const { data: rows, error } = await context.supabase
      .from("webhook_deliveries")
      .select("id, event, ok, status_code, error, duration_ms, created_at")
      .eq("webhook_id", data.webhookId)
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

// Server-side triggers for dashboard actions that must fire webhooks

export const createFeatureRequestFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    projectId: z.string().uuid(),
    title: z.string().trim().min(1).max(200),
    description: z.string().max(5000).optional().default(""),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await assertProjectOwner(context.supabase, data.projectId, context.userId);
    const { data: row, error } = await context.supabase
      .from("feature_requests")
      .insert({
        project_id: data.projectId,
        title: data.title,
        description: data.description || null,
      })
      .select("id, title, description, status")
      .single();
    if (error) throw new Error(error.message);
    const { dispatchWebhooks } = await import("@/lib/webhooks.server");
    void dispatchWebhooks(data.projectId, "feature_request.created", {
      id: row.id, title: row.title, description: row.description, status: row.status,
    });
    return { id: row.id };
  });

export const publishChangelogEntryFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    projectId: z.string().uuid(),
    title: z.string().trim().min(1).max(200),
    body: z.string().max(10000).optional().default(""),
    tag: z.string().trim().max(40).optional().nullable(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await assertProjectOwner(context.supabase, data.projectId, context.userId);
    const { data: row, error } = await context.supabase
      .from("changelog_entries")
      .insert({
        project_id: data.projectId,
        title: data.title,
        body: data.body || null,
        tag: data.tag || null,
        published: true,
      })
      .select("id, title, body, tag, published_at")
      .single();
    if (error) throw new Error(error.message);
    const { dispatchWebhooks } = await import("@/lib/webhooks.server");
    void dispatchWebhooks(data.projectId, "changelog.published", {
      id: row.id, title: row.title, body: row.body, tag: row.tag, published_at: row.published_at,
    });
    return { id: row.id };
  });
