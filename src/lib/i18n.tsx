import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "fr";

type Dict = Record<string, string>;

const en = {
  // Navbar
  "nav.features": "Features",
  "nav.pricing": "Pricing",
  "nav.changelog": "Changelog",
  "nav.cta": "Get Started Free",
  // Hero
  "hero.badge": "New: public changelog & roadmap",
  "hero.title1": "The feedback widget your users",
  "hero.title2": "will actually use",
  "hero.subtitle":
    "Drop one snippet into your app and start collecting feedback, feature requests, and votes — all in a widget that feels native to your product.",
  "hero.cta1": "Get Started Free",
  "hero.cta2": "View Demo",
  "hero.caption": "No credit card required · Free forever plan",
  // Widget mockup
  "widget.label": "Feedback",
  "widget.title": "What should we build next?",
  "widget.sub": "Vote on ideas or share your own",
  "widget.idea1": "Dark mode for the dashboard",
  "widget.idea2": "Slack notifications",
  "widget.idea3": "Export to CSV",
  "widget.suggest": "Suggest an idea",
  // How
  "how.title": "How it works",
  "how.sub": "Three steps from install to insight.",
  "how.step": "Step",
  "how.s1.t": "Paste the snippet",
  "how.s1.d": "Add one line of code to your app. Setup takes under 2 minutes.",
  "how.s2.t": "Users interact",
  "how.s2.d": "They submit ideas, vote, and discuss right inside your product.",
  "how.s3.t": "You act on feedback",
  "how.s3.d": "Prioritize what matters. Ship faster. Close the loop with a changelog.",
  // Features
  "feat.title": "Everything you need to listen better",
  "feat.sub": "A complete feedback toolkit, designed to feel like part of your product.",
  "feat.changelog.t": "Changelog",
  "feat.changelog.d": "Publish updates on a beautiful public page. Notify users right inside the widget when you ship.",
  "feat.vote.t": "Feature Voting",
  "feat.vote.d": "Let users vote and comment on what matters most. Stop guessing what to build.",
  "feat.context.t": "Contextual Feedback",
  "feat.context.d": "Capture page URL, browser, and user info automatically with every submission.",
  "feat.roadmap": "Roadmap",
  "feat.inprogress": "12 in progress",
  "feat.col.planned": "Planned",
  "feat.col.inprogress": "In Progress",
  "feat.col.shipped": "Shipped",
  "feat.nav.inbox": "Inbox",
  "feat.nav.roadmap": "Roadmap",
  "feat.nav.changelog": "Changelog",
  "feat.nav.widgets": "Widgets",
  "feat.nav.settings": "Settings",
  "feat.idea": "Idea title",
  // Pricing
  "pricing.title": "Simple, fair pricing",
  "pricing.sub": "Start free. Upgrade when you outgrow it.",
  "pricing.monthly": "Monthly",
  "pricing.yearly": "Yearly",
  "pricing.popular": "Most popular",
  "pricing.suffix.month": "/month",
  "pricing.suffix.year": "/year",
  "pricing.free.name": "Free",
  "pricing.free.desc": "For side projects getting started.",
  "pricing.free.cta": "Start free",
  "pricing.free.f1": "1 project",
  "pricing.free.f2": "Unlimited feedback",
  "pricing.free.f3": "WidgetVoice badge",
  "pricing.solo.name": "Solo",
  "pricing.solo.desc": "For makers shipping serious products.",
  "pricing.solo.cta": "Start free trial",
  "pricing.solo.f1": "3 projects",
  "pricing.solo.f2": "No WidgetVoice badge",
  "pricing.solo.f3": "Public changelog",
  "pricing.solo.f4": "Email support",
  "pricing.studio.name": "Studio",
  "pricing.studio.desc": "For teams and agencies.",
  "pricing.studio.cta": "Start free trial",
  "pricing.studio.f1": "Unlimited projects",
  "pricing.studio.f2": "Custom domain",
  "pricing.studio.f3": "API access",
  "pricing.studio.f4": "Priority support",
  // FAQ
  "faq.title": "Frequently asked questions",
  "faq.sub": "Still have a question? Reach out anytime.",
  "faq.q1": "How long does setup take?",
  "faq.a1": "Under two minutes. Copy a single snippet, paste it into your app, and the widget is live.",
  "faq.q2": "Can I customize the widget look?",
  "faq.a2": "Yes — colors, position, copy, and triggers are fully configurable. Studio plans support a custom domain too.",
  "faq.q3": "Do you offer a free plan?",
  "faq.a3": "Yes, the Free plan supports 1 project and shows a small WidgetVoice badge. Solo removes the badge.",
  "faq.q4": "Can I cancel anytime?",
  "faq.a4": "Of course. There are no contracts — cancel from your dashboard in one click.",
  "faq.q5": "Is my data secure?",
  "faq.a5": "Data is encrypted in transit and at rest. We're GDPR-compliant and hosted in the EU.",
  // Footer
  "footer.tagline": "The feedback widget your users will actually use.",
  "footer.product": "Product",
  "footer.company": "Company",
  "footer.legal": "Legal",
  "footer.about": "About",
  "footer.blog": "Blog",
  "footer.contact": "Contact",
  "footer.privacy": "Privacy",
  "footer.terms": "Terms",
  "footer.gdpr": "GDPR",
  "footer.rights": "All rights reserved.",
  "footer.made": "Made in France 🇫🇷",
  // Auth
  "auth.back": "Back to home",
  "auth.signup.title": "Create your account",
  "auth.signup.sub": "Start collecting feedback in minutes. No credit card required.",
  "auth.login.title": "Welcome back",
  "auth.login.sub": "Log in to your WidgetVoice account.",
  "auth.google": "Continue with Google",
  "auth.or": "or",
  "auth.email": "Email",
  "auth.email.ph": "you@company.com",
  "auth.referral": "Referral code (optional)",
  "auth.referral.hint": "You'll get a 14-day trial instead of 7 days.",
  "auth.promo": "Promo code (optional)",
  "auth.promo.checking": "Checking…",
  "auth.promo.applied": "off applied",
  "auth.send": "Send magic link",
  "auth.invalidEmail": "Please enter a valid email",
  "auth.checkInbox": "Check your inbox",
  "auth.sentTo": "We sent a magic link to",
  "auth.clickToSignIn": "Click it to sign in.",
  "auth.haveAccount": "Already have an account?",
  "auth.login": "Log in",
  "auth.noAccount": "New here?",
  "auth.create": "Create an account",
  "auth.couldNotCheck": "Could not check code",
  // Language
  "lang.label": "Language",
};

const fr: Dict = {
  "nav.features": "Fonctionnalités",
  "nav.pricing": "Tarifs",
  "nav.changelog": "Changelog",
  "nav.cta": "Commencer gratuitement",

  "hero.badge": "Nouveau : changelog et roadmap publics",
  "hero.title1": "Le widget de feedback que vos utilisateurs",
  "hero.title2": "utiliseront vraiment",
  "hero.subtitle":
    "Ajoutez un seul snippet à votre app et commencez à collecter des feedbacks, idées et votes — dans un widget natif à votre produit.",
  "hero.cta1": "Commencer gratuitement",
  "hero.cta2": "Voir la démo",
  "hero.caption": "Sans carte bancaire · Plan gratuit à vie",

  "widget.label": "Feedback",
  "widget.title": "Que devons-nous construire ensuite ?",
  "widget.sub": "Votez pour des idées ou partagez les vôtres",
  "widget.idea1": "Mode sombre pour le dashboard",
  "widget.idea2": "Notifications Slack",
  "widget.idea3": "Export CSV",
  "widget.suggest": "Proposer une idée",

  "how.title": "Comment ça marche",
  "how.sub": "Trois étapes de l'installation à l'insight.",
  "how.step": "Étape",
  "how.s1.t": "Collez le snippet",
  "how.s1.d": "Ajoutez une ligne de code. Installation en 2 minutes.",
  "how.s2.t": "Vos utilisateurs interagissent",
  "how.s2.d": "Ils soumettent des idées, votent, directement dans votre produit.",
  "how.s3.t": "Vous agissez",
  "how.s3.d": "Priorisez ce qui compte. Shippez plus vite. Fermez la boucle avec un changelog.",

  "feat.title": "Tout ce qu'il faut pour mieux écouter",
  "feat.sub": "Une boîte à outils complète, pensée pour s'intégrer à votre produit.",
  "feat.changelog.t": "Changelog",
  "feat.changelog.d": "Publiez vos mises à jour sur une belle page publique.",
  "feat.vote.t": "Vote de fonctionnalités",
  "feat.vote.d": "Laissez vos utilisateurs voter sur ce qui compte vraiment.",
  "feat.context.t": "Feedback contextuel",
  "feat.context.d": "URL, navigateur et infos utilisateur capturés automatiquement.",
  "feat.roadmap": "Roadmap",
  "feat.inprogress": "12 en cours",
  "feat.col.planned": "Planifié",
  "feat.col.inprogress": "En cours",
  "feat.col.shipped": "Livré",
  "feat.nav.inbox": "Boîte de réception",
  "feat.nav.roadmap": "Roadmap",
  "feat.nav.changelog": "Changelog",
  "feat.nav.widgets": "Widgets",
  "feat.nav.settings": "Paramètres",
  "feat.idea": "Titre d'idée",

  "pricing.title": "Tarifs simples et transparents",
  "pricing.sub": "Commencez gratuitement. Montez en gamme quand vous êtes prêt.",
  "pricing.monthly": "Mensuel",
  "pricing.yearly": "Annuel",
  "pricing.popular": "Le plus populaire",
  "pricing.suffix.month": "/mois",
  "pricing.suffix.year": "/an",
  "pricing.free.name": "Free",
  "pricing.free.desc": "Pour les projets qui démarrent",
  "pricing.free.cta": "Commencer",
  "pricing.free.f1": "1 projet",
  "pricing.free.f2": "Feedbacks illimités",
  "pricing.free.f3": "Badge WidgetVoice",
  "pricing.solo.name": "Solo",
  "pricing.solo.desc": "Pour les makers sérieux",
  "pricing.solo.cta": "Essayer gratuitement",
  "pricing.solo.f1": "3 projets",
  "pricing.solo.f2": "Sans badge",
  "pricing.solo.f3": "Changelog public",
  "pricing.solo.f4": "Support email",
  "pricing.studio.name": "Studio",
  "pricing.studio.desc": "Pour les équipes et agences",
  "pricing.studio.cta": "Essayer gratuitement",
  "pricing.studio.f1": "Projets illimités",
  "pricing.studio.f2": "Domaine personnalisé",
  "pricing.studio.f3": "Accès API",
  "pricing.studio.f4": "Support prioritaire",

  "faq.title": "Questions fréquentes",
  "faq.sub": "Une question ? Contactez-nous à tout moment.",
  "faq.q1": "Combien de temps prend l'installation ?",
  "faq.a1": "Moins de deux minutes. Copiez un snippet, collez-le dans votre app, et le widget est en ligne.",
  "faq.q2": "Puis-je personnaliser l'apparence du widget ?",
  "faq.a2": "Oui — couleurs, position, textes et déclencheurs sont entièrement personnalisables. Le plan Studio inclut un domaine personnalisé.",
  "faq.q3": "Y a-t-il un plan gratuit ?",
  "faq.a3": "Oui, le plan Free supporte 1 projet et affiche un petit badge WidgetVoice. Solo retire le badge.",
  "faq.q4": "Puis-je annuler à tout moment ?",
  "faq.a4": "Bien sûr. Aucun engagement — annulez depuis votre dashboard en un clic.",
  "faq.q5": "Mes données sont-elles sécurisées ?",
  "faq.a5": "Les données sont chiffrées en transit et au repos. Nous sommes conformes RGPD et hébergés dans l'UE.",

  "footer.tagline": "Le widget de feedback que vos utilisateurs utiliseront vraiment.",
  "footer.product": "Produit",
  "footer.company": "Entreprise",
  "footer.legal": "Légal",
  "footer.about": "À propos",
  "footer.blog": "Blog",
  "footer.contact": "Contact",
  "footer.privacy": "Confidentialité",
  "footer.terms": "CGU",
  "footer.gdpr": "RGPD",
  "footer.rights": "Tous droits réservés.",
  "footer.made": "Fait en France 🇫🇷",

  "auth.back": "Retour à l'accueil",
  "auth.signup.title": "Créez votre compte",
  "auth.signup.sub": "Commencez à collecter des feedbacks en quelques minutes. Sans carte bancaire.",
  "auth.login.title": "Bon retour",
  "auth.login.sub": "Connectez-vous à votre compte WidgetVoice.",
  "auth.google": "Continuer avec Google",
  "auth.or": "ou",
  "auth.email": "Email",
  "auth.email.ph": "vous@entreprise.com",
  "auth.referral": "Code de parrainage (optionnel)",
  "auth.referral.hint": "Vous aurez un essai de 14 jours au lieu de 7.",
  "auth.promo": "Code promo (optionnel)",
  "auth.promo.checking": "Vérification…",
  "auth.promo.applied": "de réduction appliqué",
  "auth.send": "Envoyer le lien magique",
  "auth.invalidEmail": "Veuillez entrer un email valide",
  "auth.checkInbox": "Vérifiez votre boîte de réception",
  "auth.sentTo": "Nous avons envoyé un lien magique à",
  "auth.clickToSignIn": "Cliquez dessus pour vous connecter.",
  "auth.haveAccount": "Vous avez déjà un compte ?",
  "auth.login": "Se connecter",
  "auth.noAccount": "Nouveau ici ?",
  "auth.create": "Créer un compte",
  "auth.couldNotCheck": "Impossible de vérifier le code",

  "lang.label": "Langue",
};

const dicts: Record<Lang, Dict> = { en, fr };

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: keyof typeof en) => string };
const I18nContext = createContext<Ctx | null>(null);

function detectInitial(): Lang {
  if (typeof window === "undefined") return "en";
  const saved = window.localStorage.getItem("wv_lang");
  if (saved === "en" || saved === "fr") return saved;
  const nav = window.navigator.language?.toLowerCase() ?? "";
  return nav.startsWith("fr") ? "fr" : "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    setLangState(detectInitial());
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    try { window.localStorage.setItem("wv_lang", l); } catch { /* ignore */ }
    if (typeof document !== "undefined") document.documentElement.lang = l;
  }

  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.lang = lang;
  }, [lang]);

  const t = (k: keyof typeof en) => dicts[lang][k] ?? en[k];

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}

export function LangSwitcher({ className = "" }: { className?: string }) {
  const { lang, setLang } = useI18n();
  return (
    <div
      className={`inline-flex items-center rounded-full border border-border bg-card p-0.5 text-xs font-semibold ${className}`}
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => setLang("en")}
        className={`rounded-full px-2.5 py-1 transition ${lang === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
        aria-pressed={lang === "en"}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang("fr")}
        className={`rounded-full px-2.5 py-1 transition ${lang === "fr" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
        aria-pressed={lang === "fr"}
      >
        FR
      </button>
    </div>
  );
}
