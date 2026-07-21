# Améliorations WidgetVoice — prochaine itération

Les phases 1 à 3 du plan initial sont livrées (landing, onboarding, widget refondu, dashboard KPIs, filtres feedbacks, SEO, JSON-LD, sitemap). Voici ce qui reste pour passer à un vrai SaaS activable et facturable.

---

## Bloc B — Robustesse

- **Rate-limiting** sur `/api/public/feedbacks`, `/vote`, `/widget.js` : table `rate_limits (bucket, key, window_start, count)` + fonction serveur, fenêtre glissante 60 s par IP + par `widget_key`.
- **Anti-spam widget** : honeypot déjà présent, ajouter longueur mini, détection de doublons < 60 s, blocage silencieux des messages identiques répétés.
- **Sécurité** : audit RLS + headers (`X-Frame-Options`, `Referrer-Policy`, CSP basique sur pages publiques).
- **Tests** : suite Vitest sur `webhooks.server`, `plans.server`, endpoints publics ; 1 smoke Playwright signup → projet → widget → feedback.

---

## Bloc C — Finitions produit (petits chantiers à fort impact)

- **Notifications email** via Lovable Email (une fois activé) : nouveau feedback, feature très votée (seuil), digest hebdo — préférences par utilisateur.
- **Colonne `type` dédiée** sur `feedbacks` (aujourd'hui préfixée au message) + filtre serveur indexé et badge visuel dans la table.
- **Détail projet** `/dashboard/projects/:id` : réglages widget (couleur, position, thème par défaut, langue forcée) + preview live du widget avec les réglages.
- **Tags feedbacks** : table `feedback_tags` (couleur + libellé) + assignation multi-tag, filtre par tag.
- **Export CSV** des feedbacks + feature requests.
- **OG images dynamiques** pour `/p/:slug/changelog` et `/p/:slug/roadmap` (route `og.$type.$id.ts` qui rend une image avec titre du projet).

---

## Ordre recommandé

TOUT FAIRE