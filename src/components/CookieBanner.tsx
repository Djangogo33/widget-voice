import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";

const KEY = "wv_cookie_ack";

export function CookieBanner() {
  const { lang } = useI18n();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(KEY)) setShow(true);
  }, []);

  if (!show) return null;

  const msg = lang === "fr"
    ? "Nous utilisons uniquement des cookies fonctionnels nécessaires au bon fonctionnement du service. Pas de tracking publicitaire."
    : "We only use functional cookies necessary for the service to work. No advertising or tracking.";
  const cta = lang === "fr" ? "J'ai compris" : "Got it";

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] p-4">
      <div className="mx-auto flex max-w-3xl flex-col items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-lg sm:flex-row sm:items-center">
        <p className="flex-1 text-sm text-foreground/80">{msg}</p>
        <button
          onClick={() => { localStorage.setItem(KEY, "1"); setShow(false); }}
          className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          {cta}
        </button>
      </div>
    </div>
  );
}
