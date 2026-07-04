
# Améliorer Widget Voice — plan complet en 4 phases

Objectif : passer d'un MVP fonctionnel à un produit prêt à convertir, activer, retenir et facturer, avec un socle robuste. Livraison séquencée en 4 phases pour garder le préview stable après chaque étape.

---

## Phase 1 — Acquisition & activation

Rendre la home vendeuse et le premier feedback atteignable en < 3 minutes.

**Landing (`/`)**
- Refonte du hero : promesse claire (« Widget de feedback embarquable — voix client, changelog public et roadmap votée »), CTA principal « Essayer gratuitement » + secondaire « Voir la démo ».
- Sections : problème/solution, démo animée du widget, 3 features clés (feedback, roadmap, changelog), preuves sociales (placeholder logos), pricing 3 tiers, FAQ, footer complet.
- Démo interactive : injecte le widget sur la page marketing elle-même en mode démo (pas de POST).

**Onboarding post-signup**
- Wizard 3 étapes : (1) créer un projet (nom + domaine), (2) copier le snippet `<script>` avec bouton « Copier », (3) écran « En attente de votre premier feedback » qui poll `feedbacks` toutes les 5s puis célèbre l'arrivée.
- Checklist persistante dans le dashboard : projet créé ✓ / widget installé ✓ / 1er feedback ✓ / 1 feature request ✓ / 1 entrée changelog ✓.
- États vides des pages dashboard repensés avec CTA guidés et exemples.

---

## Phase 2 — Produit (widget + dashboard)

**Widget (`/api/public/widget.js`)**
- Thèmes clair/sombre + auto (respect `prefers-color-scheme`), position configurable (`bottom-right` par défaut, `bottom-left`, `top-right`, `top-left`).
- Options `data-*` sur le `<script>` : `data-theme`, `data-position`, `data-lang`, `data-primary-color`.
- i18n FR/EN (détection `navigator.language`, override via `data-lang`).
- Champ email optionnel, sélecteur de type (bug / suggestion / question), screenshot toggle.
- Réduction du bundle : suppression dépendances inutiles, minification, cible < 15 KB gzip.

**Dashboard**
- Vue d'ensemble (`/dashboard`) : KPIs 30 j (feedbacks, features, votes, entrées changelog), graphe sparkline par jour, top pages sources.
- Feedbacks : recherche full-text, filtres (statut, browser, période, projet), tags (couleur + libellé), assignation à un membre (préparé pour multi-user plus tard), export CSV.
- Feature requests : drag-and-drop entre statuts (open / planned / in-progress / done), tri par votes, fusion de doublons.
- Changelog : éditeur markdown avec preview, brouillons, planification d'une date de publication.
- Détail projet : réglages widget (couleur, position, thème par défaut) + preview live.

---

## Phase 3 — Notifications, intégrations, SEO

**Notifications**
- Emails transactionnels via Lovable Email (custom domain) : nouveau feedback, feature très votée (seuil paramétrable), digest hebdomadaire par projet.
- Préférences par utilisateur (opt-in/out par type, fréquence digest).

**Intégrations en plus des webhooks existants**
- Connecteurs one-click : Slack (OAuth), Linear (créer issue depuis une feature request), GitHub (créer issue depuis un feedback bug).
- Bibliothèque de templates de webhook (Discord embed, Slack block kit, generic JSON) déjà déductible de l'URL — ajout d'un preview « Envoyer un test ».

**SEO & pages publiques**
- `head()` par route : titles/descriptions uniques sur `/`, `/pricing`, `/p/:slug/changelog`, `/p/:slug/roadmap`.
- OG images dynamiques par route publique (générées server-side avec titre du projet + dernière entrée).
- JSON-LD : `Organization` sur `/`, `Article` sur chaque entrée changelog, `BreadcrumbList` sur roadmap.
- `sitemap.xml` dynamique (liste tous les projets publics + entrées changelog publiées), `robots.txt` propre.
- Blog `/blog` avec 3-5 articles d'exemple pour le contenu SEO.

---

## Phase 4 — Monétisation & robustesse

**Facturation — Stripe (paiements gérés Lovable, pas de compte Stripe requis)**
- 3 plans : Free (1 projet, 100 feedbacks/mois), Starter (5 projets, 5 000/mois), Studio (illimité + intégrations premium).
- Page `/pricing` publique + `/dashboard/billing` (statut, changement de plan, portail client).
- Application des limites côté serveur (compte de feedbacks du mois par projet, verrous sur création projet au-delà du plan).
- Bandeau upgrade contextuel quand une limite est atteinte.

**Robustesse**
- Rate-limiting sur `/api/public/feedbacks`, `/vote`, `/widget.js` (par IP et par widget_key, fenêtre glissante en base).
- Anti-spam : honeypot dans le widget, seuil de longueur, détection de doublons < 60 s.
- Monitoring : capture erreurs client + serveur, page `/dashboard/health` interne (déjà partiellement via `error-capture`).
- Tests : suite Vitest sur les server functions clés (webhooks, votes, feedbacks) + un smoke test Playwright du parcours signup → projet → widget → feedback.
- Audit sécurité (RLS, secrets, headers) et fix des findings restants du scanner.

---

## Détails techniques

**Base de données (migrations à créer)**
- `plans` (enum), colonnes `plan`, `stripe_customer_id`, `stripe_subscription_id` sur `profiles` (via triggers privilégiés, jamais éditable par le user).
- `feedback_tags` (project_id, label, color) + `feedback_tag_assignments`.
- `notification_preferences` (user_id, event, channel, enabled, digest_frequency).
- `rate_limits` (bucket text, key text, window_start, count) — ou usage d'un compteur en mémoire si Cloudflare KV pas nécessaire.
- Vue matérialisée `project_stats_daily` pour les KPIs dashboard.

**Fichiers principaux à créer/modifier**
- `src/routes/index.tsx` (refonte hero + sections), `src/routes/pricing.tsx`, `src/routes/blog.tsx`, `src/routes/blog.$slug.tsx`.
- `src/routes/_authenticated/onboarding.tsx` (wizard), `src/routes/_authenticated/dashboard.index.tsx` (KPIs), `src/routes/_authenticated/dashboard.billing.tsx`, `src/routes/_authenticated/dashboard.integrations.tsx`, `src/routes/_authenticated/dashboard.notifications.tsx`.
- `src/routes/api/public/widget[.]js.ts` (refonte thèmes/i18n/options), `src/routes/api/public/og.$type.$id.ts` (OG images), `src/routes/sitemap[.]xml.ts`.
- `src/lib/integrations/{slack,linear,github}.functions.ts`, `src/lib/plans.server.ts` (limites), `src/lib/rate-limit.server.ts`, `src/lib/emails/*.tsx`.
- `src/components/marketing/*` (hero, pricing table, feature grid, FAQ, footer), `src/components/dashboard/OnboardingChecklist.tsx`.

**Ordre d'exécution recommandé**
1. Phase 1 (landing + onboarding) — impact conversion immédiat, pas de dépendance.
2. Phase 2 (widget + dashboard) — améliore ce que voient les early users.
3. Phase 3 (notifs/intégrations/SEO) — nécessite Lovable Email activé + connecteurs.
4. Phase 4 (billing + robustesse) — activation Stripe Payments (`enable_stripe_payments`) après validation du plan.

**Hors périmètre (à confirmer)**
- Multi-utilisateur / équipes (peut être ajouté en Phase 5).
- Version mobile native du widget.
- IA (résumés automatiques, clustering de feedbacks) — candidat pour un chantier dédié avec Lovable AI.

---

Chaque phase se termine par un préview vérifiable. Je peux démarrer Phase 1 dès validation, puis enchaîner sans nouvelle question sauf blocage explicite (ex. choix visuel de la landing, activation Stripe/Email).
