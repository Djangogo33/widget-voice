import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/LegalLayout";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/legal/cookies")({
  head: () => ({ meta: [{ title: "Politique de Cookies — WidgetVoice" }] }),
  component: Page,
});

function Page() {
  const { lang } = useI18n();
  const fr = lang === "fr";
  return (
    <LegalLayout title={fr ? "Politique de Cookies" : "Cookie Policy"}>
      <p>{fr ? "Dernière mise à jour : " : "Last updated: "}{new Date().toLocaleDateString(fr ? "fr-FR" : "en-US")}</p>

      <h2>{fr ? "Cookies utilisés" : "Cookies in use"}</h2>
      <p>
        {fr
          ? "WidgetVoice utilise uniquement des cookies strictement nécessaires au bon fonctionnement du service : session d'authentification, préférence de langue et paramètres utilisateur."
          : "WidgetVoice only uses strictly necessary cookies for service to work: authentication session, language preference and user settings."}
      </p>

      <h2>{fr ? "Pas de tracking" : "No tracking"}</h2>
      <p>
        {fr
          ? "Aucun cookie publicitaire, aucun tracker tiers, aucune analyse comportementale ne sont utilisés."
          : "No advertising cookies, no third-party trackers, no behavioral analytics are used."}
      </p>

      <h2>{fr ? "Durée" : "Duration"}</h2>
      <p>
        {fr
          ? "Cookies de session ou conservés au maximum 30 jours."
          : "Session cookies or kept for a maximum of 30 days."}
      </p>

      <h2>{fr ? "Bannière de consentement" : "Consent banner"}</h2>
      <p>
        {fr
          ? "Étant donné que nous n'utilisons aucun cookie non essentiel, aucune bannière de consentement n'est requise. Un message d'information est néanmoins affiché lors de la première visite."
          : "Since we do not use any non-essential cookies, no consent banner is required. An informational message is still shown on first visit."}
      </p>
    </LegalLayout>
  );
}
