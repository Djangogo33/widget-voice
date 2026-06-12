import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/LegalLayout";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/legal/cgu")({
  head: () => ({ meta: [{ title: "CGU — WidgetVoice" }] }),
  component: Page,
});

function Page() {
  const { lang } = useI18n();
  const fr = lang === "fr";
  return (
    <LegalLayout title={fr ? "Conditions Générales d'Utilisation" : "Terms of Service"}>
      <p>{fr ? "Dernière mise à jour : " : "Last updated: "}{new Date().toLocaleDateString(fr ? "fr-FR" : "en-US")}</p>

      <h2>1. {fr ? "Objet" : "Purpose"}</h2>
      <p>
        {fr
          ? "Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation du service WidgetVoice, plateforme SaaS permettant de collecter du feedback utilisateur via un widget intégrable."
          : "These Terms of Service (ToS) govern access to and use of WidgetVoice, a SaaS platform for collecting user feedback via an embeddable widget."}
      </p>

      <h2>2. {fr ? "Acceptation" : "Acceptance"}</h2>
      <p>
        {fr
          ? "La création d'un compte vaut acceptation pleine et entière des présentes CGU."
          : "Creating an account constitutes full and unreserved acceptance of these ToS."}
      </p>

      <h2>3. {fr ? "Description du service" : "Service description"}</h2>
      <p>
        {fr ? "WidgetVoice propose trois plans :" : "WidgetVoice offers three plans:"}
      </p>
      <ul>
        <li><strong>Free</strong> — {fr ? "1 projet, fonctionnalités essentielles." : "1 project, essential features."}</li>
        <li><strong>Solo</strong> — {fr ? "Projets et feedbacks illimités, intégrations avancées." : "Unlimited projects and feedback, advanced integrations."}</li>
        <li><strong>Studio</strong> — {fr ? "Pour les équipes, support prioritaire." : "For teams, priority support."}</li>
      </ul>

      <h2>4. {fr ? "Compte utilisateur et sécurité" : "User account and security"}</h2>
      <p>
        {fr
          ? "L'utilisateur est responsable de la confidentialité de ses identifiants. Toute activité réalisée depuis son compte est réputée effectuée par lui."
          : "The user is responsible for keeping credentials confidential. Any activity from their account is deemed performed by them."}
      </p>

      <h2>5. {fr ? "Obligations de l'utilisateur" : "User obligations"}</h2>
      <p>
        {fr
          ? "L'utilisateur s'engage à ne pas utiliser le service à des fins illicites, à ne pas porter atteinte aux droits de tiers, et à respecter la législation applicable."
          : "The user agrees not to use the service for unlawful purposes, not to infringe third-party rights, and to comply with applicable law."}
      </p>

      <h2>6. {fr ? "Résiliation et suppression de compte" : "Termination and account deletion"}</h2>
      <p>
        {fr
          ? "L'utilisateur peut résilier son compte à tout moment depuis ses paramètres. Les données sont supprimées sous 30 jours après résiliation."
          : "Users may terminate their account at any time from settings. Data is deleted within 30 days after termination."}
      </p>

      <h2>7. {fr ? "Limitation de responsabilité" : "Limitation of liability"}</h2>
      <p>
        {fr
          ? "WidgetVoice est fourni « en l'état ». L'éditeur ne saurait être tenu responsable des dommages indirects, perte de données ou interruptions de service."
          : "WidgetVoice is provided “as is.” The publisher cannot be held liable for indirect damages, data loss or service interruptions."}
      </p>

      <h2>8. {fr ? "Modifications des CGU" : "Changes to the ToS"}</h2>
      <p>
        {fr
          ? "Les présentes CGU peuvent être modifiées. Les utilisateurs seront informés au moins 30 jours avant l'entrée en vigueur des nouvelles conditions."
          : "These ToS may be amended. Users will be notified at least 30 days before new terms take effect."}
      </p>

      <h2>9. {fr ? "Droit applicable et juridiction" : "Governing law and jurisdiction"}</h2>
      <p>
        {fr
          ? "Les présentes CGU sont régies par le droit français. Tout litige relève de la compétence exclusive des tribunaux de Paris."
          : "These ToS are governed by French law. Any dispute falls under the exclusive jurisdiction of the courts of Paris."}
      </p>
    </LegalLayout>
  );
}
