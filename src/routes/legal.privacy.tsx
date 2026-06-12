import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/LegalLayout";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/legal/privacy")({
  head: () => ({ meta: [{ title: "Politique de Confidentialité — WidgetVoice" }] }),
  component: Page,
});

function Page() {
  const { lang } = useI18n();
  const fr = lang === "fr";
  return (
    <LegalLayout title={fr ? "Politique de Confidentialité" : "Privacy Policy"}>
      <p>{fr ? "Dernière mise à jour : " : "Last updated: "}{new Date().toLocaleDateString(fr ? "fr-FR" : "en-US")}</p>

      <h2>{fr ? "Responsable du traitement" : "Data controller"}</h2>
      <p><strong>[NOM / ENTREPRISE]</strong> — {fr ? "Contact" : "Contact"} : <strong>[EMAIL CONTACT]</strong></p>

      <h2>{fr ? "Données collectées" : "Data collected"}</h2>
      <ul>
        <li>{fr ? "Email, nom, avatar (via Google OAuth)" : "Email, name, avatar (via Google OAuth)"}</li>
        <li>{fr ? "Données de navigation et d'usage" : "Browsing and usage data"}</li>
        <li>{fr ? "Feedbacks et contenus soumis par les utilisateurs" : "Feedback and content submitted by users"}</li>
        <li>{fr ? "Données de paiement (traitées par Stripe, non stockées par WidgetVoice)" : "Payment data (processed by Stripe, not stored by WidgetVoice)"}</li>
      </ul>

      <h2>{fr ? "Base légale" : "Legal basis"}</h2>
      <p>{fr ? "Consentement de l'utilisateur et exécution du contrat (CGU)." : "User consent and performance of the contract (ToS)."}</p>

      <h2>{fr ? "Durée de conservation" : "Retention period"}</h2>
      <p>
        {fr
          ? "Les données sont conservées tant que le compte est actif. Elles sont supprimées sous 30 jours après résiliation du compte."
          : "Data is kept as long as the account is active. It is deleted within 30 days after account termination."}
      </p>

      <h2>{fr ? "Vos droits (RGPD Art. 15-22)" : "Your rights (GDPR Art. 15-22)"}</h2>
      <p>
        {fr
          ? "Vous disposez d'un droit d'accès, de rectification, de suppression, de portabilité et d'opposition. Pour exercer ces droits, contactez :"
          : "You have a right of access, rectification, erasure, portability and objection. To exercise these rights, contact:"}{" "}
        <strong>[EMAIL DPO OU CONTACT]</strong>.
      </p>

      <h2>{fr ? "Transferts hors UE" : "Transfers outside the EU"}</h2>
      <p>
        {fr
          ? "Certaines données peuvent être traitées par Supabase (États-Unis) dans le cadre des clauses contractuelles types (CCT) approuvées par la Commission européenne."
          : "Some data may be processed by Supabase (USA) under Standard Contractual Clauses (SCC) approved by the European Commission."}
      </p>

      <h2>Cookies</h2>
      <p>
        {fr
          ? "Nous utilisons uniquement des cookies fonctionnels (session, langue, préférences). Aucun cookie publicitaire, aucun tracker tiers."
          : "We only use functional cookies (session, language, preferences). No advertising cookies, no third-party trackers."}
      </p>

      <h2>{fr ? "Sous-traitants" : "Subprocessors"}</h2>
      <ul>
        <li>Supabase — {fr ? "hébergement, base de données, authentification" : "hosting, database, authentication"}</li>
        <li>Stripe — {fr ? "traitement des paiements" : "payment processing"}</li>
        <li>Google OAuth — {fr ? "authentification" : "authentication"}</li>
      </ul>
    </LegalLayout>
  );
}
