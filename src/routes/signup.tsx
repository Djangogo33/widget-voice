import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { ArrowLeft, Check, Loader2, Mail, Tag, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useServerFn } from "@tanstack/react-start";
import { validatePromoCode } from "@/lib/referrals.functions";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign up — WidgetVoice" },
      { name: "description", content: "Create your free WidgetVoice account." },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => ({
    ref: typeof s.ref === "string" ? s.ref : undefined,
  }),
  component: SignupPage,
});

function SignupPage() {
  const { ref } = Route.useSearch();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [referral, setReferral] = useState(ref ?? "");
  const [promo, setPromo] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState<"" | "email" | "google">("");
  const [error, setError] = useState<string | null>(null);

  const validate = useServerFn(validatePromoCode);
  const [promoState, setPromoState] = useState<{
    status: "idle" | "checking" | "valid" | "invalid";
    discount?: number;
    message?: string;
  }>({ status: "idle" });

  useEffect(() => {
    if (ref) localStorage.setItem("wv_ref", ref.toUpperCase());
  }, [ref]);

  // Auto-validate promo
  useEffect(() => {
    const code = promo.trim();
    if (!code) {
      setPromoState({ status: "idle" });
      return;
    }
    setPromoState({ status: "checking" });
    const t = setTimeout(async () => {
      try {
        const res = await validate({ data: { code } });
        if (res.valid) {
          setPromoState({ status: "valid", discount: res.discount_percent });
        } else {
          setPromoState({ status: "invalid", message: res.reason });
        }
      } catch {
        setPromoState({ status: "invalid", message: "Could not check code" });
      }
    }, 400);
    return () => clearTimeout(t);
  }, [promo, validate]);

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = z.string().email().safeParse(email);
    if (!parsed.success) {
      setError("Please enter a valid email");
      return;
    }
    if (referral.trim()) localStorage.setItem("wv_ref", referral.trim().toUpperCase());
    if (promo.trim()) localStorage.setItem("wv_promo", promo.trim().toUpperCase());

    setLoading("email");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });
    setLoading("");
    if (error) setError(error.message);
    else setSent(true);
  }

  async function handleGoogle() {
    setError(null);
    if (referral.trim()) localStorage.setItem("wv_ref", referral.trim().toUpperCase());
    if (promo.trim()) localStorage.setItem("wv_promo", promo.trim().toUpperCase());
    setLoading("google");
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/dashboard`,
    });
    if (result.error) {
      setLoading("");
      setError(result.error instanceof Error ? result.error.message : String(result.error));
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard" });
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start collecting feedback in minutes. No credit card required."
    >
      {sent ? (
        <SuccessState email={email} />
      ) : (
        <>
          <button
            onClick={handleGoogle}
            disabled={!!loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold transition hover:bg-muted disabled:opacity-60"
          >
            {loading === "google" ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
            Continue with Google
          </button>

          <Divider />

          <form onSubmit={handleEmail} className="space-y-3">
            <LabeledInput
              icon={Mail}
              label="Email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={setEmail}
              autoComplete="email"
              required
            />

            <LabeledInput
              icon={Sparkles}
              label="Referral code (optional)"
              placeholder="FRIEND2024"
              value={referral}
              onChange={(v) => setReferral(v.toUpperCase())}
              hint={referral ? "You'll get a 14-day trial instead of 7 days." : undefined}
            />

            <LabeledInput
              icon={Tag}
              label="Promo code (optional)"
              placeholder="LAUNCH20"
              value={promo}
              onChange={(v) => setPromo(v.toUpperCase())}
              hint={
                promoState.status === "valid"
                  ? `✓ ${promoState.discount}% off applied`
                  : promoState.status === "invalid"
                    ? promoState.message
                    : promoState.status === "checking"
                      ? "Checking…"
                      : undefined
              }
              hintTone={
                promoState.status === "valid"
                  ? "good"
                  : promoState.status === "invalid"
                    ? "bad"
                    : "muted"
              }
            />

            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
            )}

            <button
              type="submit"
              disabled={!!loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
            >
              {loading === "email" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Send magic link
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">Log in</Link>
          </p>
        </>
      )}
    </AuthShell>
  );
}

/* ---------- Shared bits exported for /login ---------- */
export function AuthShell({
  title, subtitle, children,
}: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-md flex-col px-6 py-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
        <div className="mt-10 rounded-2xl border border-border bg-card p-7 shadow-sm">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function LabeledInput({
  icon: Icon, label, hint, hintTone = "muted", value, onChange, ...rest
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  hint?: string;
  hintTone?: "muted" | "good" | "bad";
  value: string;
  onChange: (v: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-foreground">{label}</label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          {...rest}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-3 text-sm outline-none ring-primary/30 transition focus:border-primary focus:ring-2"
        />
      </div>
      {hint && (
        <p
          className={`mt-1.5 text-xs ${
            hintTone === "good" ? "text-primary" : hintTone === "bad" ? "text-destructive" : "text-muted-foreground"
          }`}
        >
          {hint}
        </p>
      )}
    </div>
  );
}

export function Divider() {
  return (
    <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
      <span className="h-px flex-1 bg-border" />
      <span>or</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

export function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-8.9z" />
      <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1C3.4 21.5 7.4 24 12 24z" />
      <path fill="#FBBC05" d="M5.4 14.4c-.2-.7-.4-1.4-.4-2.4s.1-1.6.4-2.4V6.5H1.4C.5 8.2 0 10 0 12s.5 3.8 1.4 5.5l4-3.1z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.4.6 4.6 1.8l3.4-3.4C17.9 1.2 15.2 0 12 0 7.4 0 3.4 2.5 1.4 6.5l4 3.1C6.3 6.8 8.9 4.8 12 4.8z" />
    </svg>
  );
}

export function SuccessState({ email }: { email: string }) {
  return (
    <div className="text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary-soft text-primary">
        <Check className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">Check your inbox</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        We sent a magic link to <span className="font-medium text-foreground">{email}</span>. Click it to sign in.
      </p>
    </div>
  );
}
