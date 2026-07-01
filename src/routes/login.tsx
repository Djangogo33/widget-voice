import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";
import { Loader2, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useI18n } from "@/lib/i18n";
import {
  AuthShell, LabeledInput, Divider, GoogleIcon, SuccessState,
} from "./signup";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — WidgetVoice" },
      { name: "description", content: "Log in to your WidgetVoice account." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState<"" | "email" | "google">("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);


  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = z.string().email().safeParse(email);
    if (!parsed.success) {
      setError(t("auth.invalidEmail"));
      return;
    }
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
    setLoading("google");
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
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
    <AuthShell title={t("auth.login.title")} subtitle={t("auth.login.sub")}>
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
            {t("auth.google")}
          </button>

          <Divider />

          <form onSubmit={handleEmail} className="space-y-3">
            <LabeledInput
              icon={Mail}
              label={t("auth.email")}
              type="email"
              placeholder={t("auth.email.ph")}
              value={email}
              onChange={setEmail}
              autoComplete="email"
              required
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
              {t("auth.send")}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t("auth.noAccount")}{" "}
            <Link to="/signup" className="font-semibold text-primary hover:underline">{t("auth.create")}</Link>
          </p>
        </>
      )}
    </AuthShell>
  );
}
