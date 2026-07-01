# Plan — Widget public + pages publiques + onboarding

Deux gros blocs pour rendre WidgetVoice utilisable de bout en bout : le widget JS que les clients collent sur leur site, et les pages publiques (changelog + feature requests avec votes), plus un onboarding minimal.

## 1. Widget JS embarquable public

**But** : `<script src="…/widget.js" data-key="…" async>` affiche un bouton flottant, ouvre un formulaire, capture une screenshot, envoie le feedback.

- Route serveur `src/routes/api/public/widget[.]js.ts` → renvoie un JS auto-exécutant (Content-Type `application/javascript`, CORS `*`).
- Le script :
  - lit `data-key` sur son propre `<script>`
  - injecte un bouton flottant + panneau (Shadow DOM pour isoler les styles)
  - champs : message (obligatoire), email (optionnel), case "joindre une capture"
  - screenshot via `html2canvas` chargé dynamiquement en CDN quand l'utilisateur coche la case (garde le widget léger)
  - POST vers `/api/public/feedbacks`
- Route serveur `src/routes/api/public/feedbacks.ts` (POST + OPTIONS CORS) :
  - valide `{ widget_key, message, email?, page_url, user_agent, screenshot_base64? }` avec Zod
  - resout `project_id` via `widget_key` en utilisant `supabaseAdmin` (import dynamique dans le handler)
  - si screenshot : upload dans bucket Storage `feedback-screenshots` (à créer, public read), stocke l'URL
  - insert dans `feedbacks` (status `open`, `browser` = UA parsé simplement)
  - jamais de PII renvoyée, réponse `{ ok: true }`
- Migration : créer bucket storage `feedback-screenshots` public en lecture ; s'assurer que la colonne `screenshot_url` existe sur `feedbacks` (sinon l'ajouter).
- Bouton "Copy snippet" existant dans `dashboard.projects.tsx` pointe déjà vers `/widget.js` — remplacer par `/api/public/widget.js?k=KEY` ou lecture via `data-key` (on garde `data-key`).

## 2. Pages publiques changelog + feature requests

URLs partageables par les clients de leurs utilisateurs finaux.

- `src/routes/p.$slug.changelog.tsx` → liste des entrées publiées d'un projet, triées par date.
- `src/routes/p.$slug.roadmap.tsx` → liste des feature requests avec compteur de votes + bouton "Voter".
- `slug` = nouvelle colonne sur `projects` (unique, généré depuis le nom à la création ; migration + backfill).
- Vote anonyme identifié par un cookie `wv_voter` (UUID généré côté client, stocké 1 an). Une table `feature_votes(feature_request_id, voter_id, created_at)` avec unique `(feature_request_id, voter_id)`.
- Server route publique `POST /api/public/vote` : Zod + insert idempotent + renvoie le nouveau count.
- Lecture publique via client Supabase publishable (anon) + policies `TO anon SELECT` sur `changelog_entries` (published only), `feature_requests` (status public), `feature_votes` (count seulement — utiliser une vue ou une RPC `get_public_features(slug)`).
- `head()` par route avec title/description dynamiques basés sur le nom du projet, i18n FR/EN via `useI18n`.

## 3. Onboarding minimal

- Après login, si `projects` est vide → redirection auto vers `/dashboard/projects?new=1` qui ouvre la modale existante.
- Après création du 1er projet : afficher un panneau "Installation" (snippet + lien vers page publique changelog) au lieu de juste fermer la modale.
- Rien de plus (pas de wizard multi-étapes, on reste MVP).

## Détails techniques

**Nouvelles routes fichiers**
```
src/routes/api/public/widget[.]js.ts
src/routes/api/public/feedbacks.ts
src/routes/api/public/vote.ts
src/routes/p.$slug.changelog.tsx
src/routes/p.$slug.roadmap.tsx
```

**Migration Supabase** (un seul fichier)
- `projects` : ajouter `slug text unique not null` + trigger de génération depuis `name` à l'insert si null.
- `feedbacks` : s'assurer que `screenshot_url text` et `browser text` existent.
- `feature_votes` : nouvelle table + GRANT anon SELECT / INSERT + RLS.
- Storage bucket `feedback-screenshots` (public read via policy).
- Policies `TO anon SELECT` sur `changelog_entries` (WHERE published) et `feature_requests`.
- RPC `get_public_project(slug)` (SECURITY DEFINER) qui renvoie project + entries + features + counts en un appel — évite d'exposer les tables directement.

**Sécurité**
- Aucune donnée sensible dans `/api/public/*`. Le widget_key est un identifiant public (pas un secret).
- Rate limiting simple par IP sur `POST /api/public/feedbacks` (compteur en mémoire — best effort MVP ; à améliorer plus tard).
- `supabaseAdmin` importé **uniquement à l'intérieur des handlers**, jamais au top-level.

**Hors scope (à faire plus tard)**
- Paiement/plans Stripe
- Emails transactionnels
- Modération/spam avancé
- Widget très personnalisable (couleurs, position)
