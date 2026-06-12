import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Copy, Check, Sparkles, Gift } from "lucide-react";
import { useDashboard } from "@/components/dashboard/DashboardShell";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { applyReferralCode } from "@/lib/referrals.functions";

export const Route = createFileRoute("/_authenticated/dashboard/referrals")({
  component: ReferralsPage,
});

type Row = {
  id: string;
  status: string;
  created_at: string;
  referred_id: string;
  referred_email: string | null;
};

function ReferralsPage() {
  const apply = useServerFn(applyReferralCode);
  const [code, setCode] = useState<string>("");
  const [freeMonths, setFreeMonths] = useState(0);
  const [rows, setRows] = useState<Row[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      const pending = localStorage.getItem("wv_ref");
      if (pending) {
        try { await apply({ data: { code: pending } }); } catch { /* noop */ }
        localStorage.removeItem("wv_ref");
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: p } = await supabase
        .from("profiles")
        .select("referral_code, free_months_credit")
        .eq("id", user.id)
        .maybeSingle();
      if (p) {
        setCode(p.referral_code);
        setFreeMonths(p.free_months_credit ?? 0);
      }
      const { data: refs } = await supabase
        .from("referrals")
        .select("id, status, created_at, referred_id")
        .eq("referrer_id", user.id)
        .order("created_at", { ascending: false });
      const list = (refs ?? []) as Array<{ id: string; status: string; created_at: string; referred_id: string }>;
      const ids = list.map((r) => r.referred_id);
      let emailMap: Record<string, string | null> = {};
      if (ids.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, email")
          .in("id", ids);
        emailMap = Object.fromEntries((profs ?? []).map((p: any) => [p.id, p.email]));
      }
      setRows(list.map((r) => ({ ...r, referred_email: emailMap[r.referred_id] ?? null })));
    })();
  }, [apply]);

  const link = code ? `${typeof window !== "undefined" ? window.location.origin : ""}/signup?ref=${code}` : "";
  const total = rows.length;
  const pending = rows.filter((r) => r.status !== "rewarded" && r.status !== "confirmed").length;

  function copy() {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Referrals</h1>
        <p className="mt-1 text-sm text-muted-foreground">Invite friends, earn free months on Solo.</p>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4 text-sm">
        <Gift className="h-5 w-5 text-primary" />
        <div>
          <span className="font-semibold">Invite a friend</span>
          <span className="text-muted-foreground"> → you both get a bonus month.</span>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold">Your referral link</h2>
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            readOnly
            value={link}
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2.5 font-mono text-sm"
          />
          <button
            onClick={copy}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy link"}
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Total referred" value={total} />
        <Stat label="Months earned" value={freeMonths} />
        <Stat label="Pending" value={pending} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-5 py-3 text-sm font-semibold">Referred users</div>
        {rows.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">No referrals yet. Share your link!</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-border/60 last:border-0">
                  <td className="px-5 py-3">{r.referred_email ?? "—"}</td>
                  <td className="px-5 py-3 text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-3"><RefStatus status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-bold tracking-tight">{value}</div>
    </div>
  );
}

function RefStatus({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    confirmed: "bg-blue-100 text-blue-700",
    rewarded: "bg-emerald-100 text-emerald-700",
    completed: "bg-emerald-100 text-emerald-700",
  };
  const cls = map[status] ?? "bg-muted text-muted-foreground";
  return <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium capitalize ${cls}`}>{status}</span>;
}
