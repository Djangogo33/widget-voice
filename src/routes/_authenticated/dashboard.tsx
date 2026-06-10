import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Copy, LogOut, MessageSquare, Sparkles, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { applyReferralCode } from "@/lib/referrals.functions";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — WidgetVoice" }] }),
  component: Dashboard,
});

type Profile = {
  email: string | null;
  plan: string;
  referral_code: string;
  free_months_credit: number;
  trial_ends_at: string;
  referred_by: string | null;
};

function Dashboard() {
  const navigate = useNavigate();
  const apply = useServerFn(applyReferralCode);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [referralCount, setReferralCount] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      // Apply pending referral / promo from localStorage
      const ref = localStorage.getItem("wv_ref");
      if (ref) {
        try {
          await apply({ data: { code: ref } });
        } catch { /* ignore */ }
        localStorage.removeItem("wv_ref");
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: p } = await supabase
        .from("profiles")
        .select("email, plan, referral_code, free_months_credit, trial_ends_at, referred_by")
        .eq("id", user.id)
        .maybeSingle();
      if (p) setProfile(p as Profile);

      const { count } = await supabase
        .from("referrals")
        .select("id", { count: "exact", head: true })
        .eq("referrer_id", user.id);
      setReferralCount(count ?? 0);
    })();
  }, [apply]);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  const link = profile
    ? `${window.location.origin}/signup?ref=${profile.referral_code}`
    : "";

  function copy() {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const trialDays = profile
    ? Math.max(0, Math.ceil((new Date(profile.trial_ends_at).getTime() - Date.now()) / 86400000))
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <MessageSquare className="h-4 w-4" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold tracking-tight">WidgetVoice</span>
          </Link>
          <button
            onClick={signOut}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-6 py-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back 👋</h1>
          <p className="mt-1 text-muted-foreground">{profile?.email}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="Current plan" value={(profile?.plan ?? "free").toUpperCase()} />
          <Stat label="Trial remaining" value={`${trialDays} days`} />
          <Stat label="Free months earned" value={`${profile?.free_months_credit ?? 0}`} />
        </div>

        {/* Referral card */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-semibold">Your referral link</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Share your link. For every signup, you get <span className="font-semibold text-foreground">1 month free</span> on Solo. They get a 14-day trial instead of 7.
          </p>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
              readOnly
              value={link}
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2.5 font-mono text-sm text-foreground"
            />
            <button
              onClick={copy}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy link"}
            </button>
          </div>

          <div className="mt-5 flex items-center gap-6 border-t border-border pt-4 text-sm">
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">People referred</div>
              <div className="mt-0.5 text-2xl font-bold">{referralCount}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Your code</div>
              <div className="mt-0.5 font-mono text-base font-semibold text-primary">
                {profile?.referral_code ?? "—"}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
          <h3 className="text-base font-semibold">Your projects will appear here</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first widget to start collecting feedback.
          </p>
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-bold tracking-tight">{value}</div>
    </div>
  );
}
