import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/LegalLayout";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/legal/mentions-legales")({
  head: () => ({ meta: [{ title: "Mentions légales — WidgetVoice" }] }),
  component: Page,
});

function Page() {
  const { lang } = useI18n();
  const fr = lang === "fr";
  return (
    <LegalLayout title={fr ? "Mentions légales" : "Legal Notice"}>
      <p>{fr ? "Dernière mise à jour : " : "Last updated: "}{new Date().toLocaleDateString(fr ? "fr-FR" : "en-US")}</p>

      <h2>{fr ? "Éditeur du site" : "Site publisher"}</h2>
      <p>
        WidgetVoice, {fr ? "SaaS édité par" : "SaaS published by"} <strong>[NOM PRÉNOM]</strong>.<br />
        {fr ? "Adresse" : "Address"}: <strong>[ADRESSE]</strong>.<br />
        {fr ? "Contact" : "Contact"}: <strong>[EMAIL CONTACT]</strong>.
      </p>

      <h2>{fr ? "Directeur de la publication" : "Publication director"}</h2>
      <p><strong>[NOM PRÉNOM]</strong></p>

      <h2>{fr ? "Hébergement" : "Hosting"}</h2>
      <p>
        {fr
          ? "Le site est hébergé par Lovable et Supabase. Les données sont stockées sur l'infrastructure cloud des hébergeurs."
          : "The site is hosted by Lovable and Supabase. Data is stored on the hosts' cloud infrastructure."}
      </p>

      <h2>{fr ? "Propriété intellectuelle" : "Intellectual property"}</h2>
      <p>
        {fr
          ? "L'ensemble des éléments du site (marque, logo, textes, graphismes, code) sont la propriété exclusive de WidgetVoice. Tous droits réservés. Toute reproduction sans autorisation préalable est interdite."
          : "All elements on the site (brand, logo, texts, graphics, code) are the exclusive property of WidgetVoice. All rights reserved. Any reproduction without prior authorization is prohibited."}
      </p>
    </LegalLayout>
  );
}
