import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/LegalLayout";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/legal/terms-of-sale")({
  head: () => ({ meta: [{ title: "CGV — WidgetVoice" }] }),
  component: Page,
});

function Page() {
  const { lang } = useI18n();
  const fr = lang === "fr";
  return (
    <LegalLayout title={fr ? "Conditions Générales de Vente" : "Terms of Sale"}>
      <p>{fr ? "Dernière mise à jour : " : "Last updated: "}{new Date().toLocaleDateString(fr ? "fr-FR" : "en-US")}</p>

      <h2>1. {fr ? "Champ d'application" : "Scope"}</h2>
      <p>
        {fr
          ? "Les présentes Conditions Générales de Vente (CGV) s'appliquent aux abonnements payants Solo et Studio. Le plan Free n'est pas concerné."
          : "These Terms of Sale (ToS) apply to paid Solo and Studio subscriptions. The Free plan is not concerned."}
      </p>

      <h2>2. {fr ? "Prix" : "Price"}</h2>
      <p>
        {fr
          ? "Les prix sont affichés en euros, toutes taxes comprises (TTC). La TVA applicable dépend du pays de résidence de l'utilisateur, conformément aux règles européennes du guichet unique (OSS)."
          : "Prices are displayed in euros, all taxes included. The applicable VAT depends on the user's country of residence, in accordance with European One-Stop Shop (OSS) rules."}
      </p>

      <h2>3. {fr ? "Paiement" : "Payment"}</h2>
      <p>
        {fr
          ? "Les paiements sont traités de manière sécurisée par Stripe (carte bancaire, SEPA). WidgetVoice ne stocke aucune donnée bancaire."
          : "Payments are securely processed by Stripe (credit card, SEPA). WidgetVoice does not store any banking data."}
      </p>

      <h2>4. {fr ? "Facturation" : "Billing"}</h2>
      <p>
        {fr
          ? "La facturation est mensuelle ou annuelle selon le choix de l'utilisateur lors de la souscription. Le renouvellement est automatique."
          : "Billing is monthly or annual, depending on the user's choice at signup. Renewal is automatic."}
      </p>

      <h2>5. {fr ? "Droit de rétractation" : "Right of withdrawal"}</h2>
      <p>
        {fr
          ? "Conformément au droit européen, l'utilisateur dispose d'un délai de 14 jours pour se rétracter à compter de la souscription."
          : "Under European law, users have a 14-day withdrawal period from the date of subscription."}
      </p>

      <h2>6. {fr ? "Résiliation et remboursement" : "Termination and refund"}</h2>
      <p>
        {fr
          ? "L'utilisateur peut résilier son abonnement à tout moment. En cas de résiliation, un remboursement au prorata de la période non utilisée peut être effectué."
          : "Users may cancel their subscription at any time. A pro-rata refund of the unused period may be issued upon cancellation."}
      </p>

      <h2>7. {fr ? "TVA" : "VAT"}</h2>
      <p>
        {fr
          ? "La TVA est appliquée selon le pays de l'utilisateur, conformément aux règles OSS de l'Union européenne."
          : "VAT is applied based on the user's country, in accordance with EU OSS rules."}
      </p>

      <h2>8. {fr ? "Droit applicable" : "Governing law"}</h2>
      <p>
        {fr
          ? "Les présentes CGV sont régies par le droit français. Tribunal compétent : Paris."
          : "These Terms of Sale are governed by French law. Competent court: Paris."}
      </p>
    </LegalLayout>
  );
}
