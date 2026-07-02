import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, Eye, EyeOff, Send, RefreshCw, Copy, Check, X, Power } from "lucide-react";
import { useDashboard } from "@/components/dashboard/DashboardShell";
import {
  listWebhooks, createWebhook, updateWebhook, deleteWebhook,
  rotateWebhookSecret, sendTestWebhook, listRecentDeliveries,
} from "@/lib/webhooks.functions";

export const Route = createFileRoute("/_authenticated/dashboard/webhooks")({
  component: WebhooksPage,
});

type Webhook = {
  id: string;
  name: string;
  url: string;
  events: string[];
  active: boolean;
  secret: string;
  last_success_at: string | null;
  last_error_at: string | null;
  last_error_message: string | null;
  failure_count: number;
  created_at: string;
};

const EVENTS = [
  { id: "feedback.created", label: "New feedback", desc: "Sent every time the widget receives a feedback." },
  { id: "feature_request.created", label: "New feature request", desc: "When you or an admin adds a feature request." },
  { id: "feature_vote.created", label: "New vote", desc: "Sent for each public vote (can be noisy)." },
  { id: "changelog.published", label: "Changelog published", desc: "When a changelog entry goes public." },
] as const;

function WebhooksPage() {
  const { current } = useDashboard();
  const _list = useServerFn(listWebhooks);
  const _create = useServerFn(createWebhook);
  const _update = useServerFn(updateWebhook);
  const _delete = useServerFn(deleteWebhook);
  const _rotate = useServerFn(rotateWebhookSecret);
  const _test = useServerFn(sendTestWebhook);

  const [hooks, setHooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Webhook | "new" | null>(null);
  const [inspecting, setInspecting] = useState<Webhook | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!current) { setHooks([]); return; }
    setLoading(true);
    try {
      const rows = await _list({ data: { projectId: current.id } });
      setHooks(rows as Webhook[]);
    } finally { setLoading(false); }
  }, [current, _list]);
  useEffect(() => { load(); }, [load]);

  async function onTest(w: Webhook) {
    const res = await _test({ data: { id: w.id } });
    setFlash(res.ok ? `Test OK (HTTP ${res.status})` : `Test failed: ${res.error ?? `HTTP ${res.status}`}`);
    setTimeout(() => setFlash(null), 4000);
    load();
  }
  async function onToggle(w: Webhook) {
    await _update({ data: { id: w.id, active: !w.active } });
    load();
  }
  async function onDelete(w: Webhook) {
    if (!confirm(`Delete webhook "${w.name}"?`)) return;
    await _delete({ data: { id: w.id } });
    load();
  }
  async function onRotate(w: Webhook) {
    if (!confirm("Rotate the signing secret? Existing verifiers will break until updated.")) return;
    await _rotate({ data: { id: w.id } });
    load();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Webhooks</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Send events from {current?.name ?? "your project"} to Discord, Slack, Zapier, or any HTTPS endpoint.
          </p>
        </div>
        <button
          onClick={() => setEditing("new")}
          disabled={!current}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
        >
          <Plus className="h-4 w-4" /> New webhook
        </button>
      </div>

      {flash && (
        <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm">{flash}</div>
      )}

      {!current ? (
        <Empty title="No project selected" sub="Pick one from the top bar." />
      ) : loading ? (
        <Empty title="Loading…" sub="" />
      ) : hooks.length === 0 ? (
        <Empty
          title="No webhooks yet"
          sub="Add a Discord webhook URL to get feedback pings in your server."
        />
      ) : (
        <div className="space-y-3">
          {hooks.map((w) => (
            <div key={w.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${w.active ? "bg-emerald-500" : "bg-muted-foreground/40"}`} />
                    <h3 className="truncate text-base font-semibold">{w.name}</h3>
                    {/discord\.com\/api\/webhooks/i.test(w.url) && (
                      <span className="rounded-md bg-indigo-100 px-1.5 py-0.5 text-xs font-medium text-indigo-700">Discord</span>
                    )}
                  </div>
                  <div className="mt-1 truncate text-xs text-muted-foreground">{w.url}</div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {w.events.map((e) => (
                      <span key={e} className="rounded-md bg-muted px-1.5 py-0.5 text-xs">{e}</span>
                    ))}
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {w.last_success_at && <>Last success {new Date(w.last_success_at).toLocaleString()} · </>}
                    {w.failure_count > 0 && (
                      <span className="text-destructive">{w.failure_count} recent failures</span>
                    )}
                    {w.last_error_message && <> · {w.last_error_message}</>}
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <IconBtn onClick={() => onTest(w)} title="Send test"><Send className="h-4 w-4" /></IconBtn>
                  <IconBtn onClick={() => setInspecting(w)} title="View secret & history"><Eye className="h-4 w-4" /></IconBtn>
                  <IconBtn onClick={() => onToggle(w)} title={w.active ? "Disable" : "Enable"}><Power className="h-4 w-4" /></IconBtn>
                  <IconBtn onClick={() => setEditing(w)} title="Edit"><RefreshCw className="h-4 w-4" /></IconBtn>
                  <IconBtn onClick={() => onDelete(w)} title="Delete" danger><Trash2 className="h-4 w-4" /></IconBtn>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && current && (
        <WebhookForm
          projectId={current.id}
          initial={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
          create={_create}
          update={_update}
        />
      )}

      {inspecting && (
        <InspectPanel
          webhook={inspecting}
          onClose={() => setInspecting(null)}
          onRotate={async () => { await onRotate(inspecting); setInspecting(null); }}
        />
      )}
    </div>
  );
}

function Empty({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
      <h3 className="text-base font-semibold">{title}</h3>
      {sub && <p className="mt-1 text-sm text-muted-foreground">{sub}</p>}
    </div>
  );
}

function IconBtn({ children, onClick, title, danger }: { children: React.ReactNode; onClick: () => void; title: string; danger?: boolean }) {
  return (
    <button onClick={onClick} title={title}
      className={`rounded-md p-1.5 ${danger ? "text-muted-foreground hover:bg-destructive/10 hover:text-destructive" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
      {children}
    </button>
  );
}

function WebhookForm({
  projectId, initial, onClose, onSaved, create, update,
}: {
  projectId: string;
  initial: Webhook | null;
  onClose: () => void;
  onSaved: () => void;
  create: ReturnType<typeof useServerFn<typeof createWebhook>>;
  update: ReturnType<typeof useServerFn<typeof updateWebhook>>;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [url, setUrl] = useState(initial?.url ?? "");
  const [events, setEvents] = useState<string[]>(initial?.events ?? ["feedback.created"]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function toggle(id: string) {
    setEvents((cur) => cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);
  }
  async function save() {
    setErr(null);
    if (!name.trim() || !url.trim() || events.length === 0) {
      setErr("Name, URL and at least one event are required.");
      return;
    }
    if (!url.startsWith("https://")) { setErr("URL must be https."); return; }
    setBusy(true);
    try {
      if (initial) {
        await update({ data: { id: initial.id, name, url, events: events as any } });
      } else {
        await create({ data: { projectId, name, url, events: events as any } });
      }
      onSaved();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to save");
    } finally { setBusy(false); }
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      <div className="fixed inset-0 z-50 grid place-items-center p-4">
        <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl">
          <div className="flex items-start justify-between">
            <h2 className="text-lg font-semibold">{initial ? "Edit webhook" : "New webhook"}</h2>
            <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button>
          </div>
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Discord #feedbacks"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">URL (https)</label>
              <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://discord.com/api/webhooks/..."
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono" />
              <p className="mt-1 text-xs text-muted-foreground">
                Discord URLs are auto-formatted as rich embeds. Other URLs receive raw JSON with an <code>X-WidgetVoice-Signature</code> HMAC header.
              </p>
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Events</label>
              <div className="mt-2 space-y-2">
                {EVENTS.map((ev) => (
                  <label key={ev.id} className="flex cursor-pointer items-start gap-2 rounded-lg border border-border p-2 hover:bg-muted/40">
                    <input type="checkbox" checked={events.includes(ev.id)} onChange={() => toggle(ev.id)} className="mt-1" />
                    <div>
                      <div className="text-sm font-medium">{ev.label}</div>
                      <div className="text-xs text-muted-foreground">{ev.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            {err && <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{err}</div>}
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <button onClick={onClose} className="rounded-lg border border-border px-3 py-2 text-sm">Cancel</button>
            <button onClick={save} disabled={busy}
              className="rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">
              {busy ? "Saving…" : initial ? "Save" : "Create"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function InspectPanel({
  webhook, onClose, onRotate,
}: { webhook: Webhook; onClose: () => void; onRotate: () => void }) {
  const _deliveries = useServerFn(listRecentDeliveries);
  const [deliveries, setDeliveries] = useState<Array<{
    id: string; event: string; ok: boolean; status_code: number | null;
    error: string | null; duration_ms: number | null; created_at: string;
  }>>([]);
  const [showSecret, setShowSecret] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    _deliveries({ data: { webhookId: webhook.id } }).then((r) => setDeliveries(r as any));
  }, [webhook.id, _deliveries]);

  function copySecret() {
    navigator.clipboard.writeText(webhook.secret);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col overflow-y-auto border-l border-border bg-card p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Webhook</div>
            <h2 className="mt-1 text-lg font-semibold">{webhook.name}</h2>
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>

        <div className="mt-4">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Signing secret</div>
          <div className="mt-1 flex items-center gap-2">
            <code className="flex-1 truncate rounded-md bg-muted px-2 py-1.5 text-xs">
              {showSecret ? webhook.secret : "•".repeat(24)}
            </code>
            <button onClick={() => setShowSecret((s) => !s)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
              {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            <button onClick={copySecret} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Verify inbound payloads by computing <code>sha256=HEX(HMAC(secret, rawBody))</code> and comparing with the <code>X-WidgetVoice-Signature</code> header.
          </p>
          <button onClick={onRotate} className="mt-3 text-xs font-medium text-primary hover:underline">Rotate secret</button>
        </div>

        <div className="mt-6">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Recent deliveries</div>
          {deliveries.length === 0 ? (
            <div className="mt-2 rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
              No deliveries yet. Use the “Send test” button.
            </div>
          ) : (
            <ul className="mt-2 space-y-1.5">
              {deliveries.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-2 rounded-md border border-border px-2 py-1.5 text-xs">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${d.ok ? "bg-emerald-500" : "bg-destructive"}`} />
                    <span className="truncate font-medium">{d.event}</span>
                  </div>
                  <div className="shrink-0 text-muted-foreground">
                    {d.status_code ?? "—"} · {d.duration_ms ?? 0}ms · {new Date(d.created_at).toLocaleTimeString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}
