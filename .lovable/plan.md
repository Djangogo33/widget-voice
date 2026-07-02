Ajout d'un système de webhooks sortants par projet, avec sélection fine des événements, signature HMAC, et rendu Discord natif.

## 1. Base de données (une migration)

Table `webhooks` (par projet) :
- `project_id` → projects.id
- `name` (label lisible, ex. "Discord #feedbacks")
- `url` (https, max 2000)
- `events` (text[] parmi `feedback.created`, `feature_request.created`, `feature_vote.created`, `changelog.published`)
- `secret` (généré côté serveur, sert au HMAC)
- `active` (bool, default true)
- `last_success_at`, `last_error_at`, `last_error_message`, `failure_count`
- RLS : accès uniquement au propriétaire du projet (via `projects.user_id = auth.uid()`), plus `service_role` pour l'exécution serveur.
- GRANTs standards `authenticated` + `service_role`.

Table `webhook_deliveries` (historique, dernières livraisons) :
- `webhook_id`, `event`, `status_code`, `ok` (bool), `error`, `duration_ms`, `payload` (jsonb)
- Politique lecture réservée au propriétaire du projet parent.

## 2. Déclencheurs de webhooks

Aucun trigger Postgres HTTP (indisponible). À la place, on appelle une helper serveur `dispatchWebhooks(projectId, event, payload)` **depuis les points d'entrée déjà serveur** qui créent la donnée :

- `src/routes/api/public/feedbacks.ts` → après insert feedback → event `feedback.created`
- `src/routes/api/public/vote.ts` → après vote → event `feature_vote.created`
- Dashboard : création de feature request (via un nouveau serverFn `createFeatureRequest`) → `feature_request.created`
- Dashboard : publication changelog (nouveau serverFn `publishChangelogEntry`) → `changelog.published`

Les deux dashboards utilisent aujourd'hui `supabase.from(...)` directement côté client — on ajoute des serverFn dédiés pour ces deux actions afin de pouvoir déclencher les webhooks (les updates non liés au trigger restent côté client).

## 3. Helper d'envoi (`src/lib/webhooks.server.ts`)

- Charge les webhooks actifs du projet dont `events` contient l'event.
- Construit un payload JSON `{ id, event, project: { id, name, slug }, data, created_at }`.
- Si l'URL matche `discord.com/api/webhooks` → transforme en `{ username, embeds: [...] }` (couleur par event, titre, description tronquée, champs utiles, lien vers dashboard).
- Autres URLs → JSON brut + headers :
  - `X-WidgetVoice-Event`
  - `X-WidgetVoice-Delivery` (UUID)
  - `X-WidgetVoice-Signature: sha256=<hex>` calculé sur le body avec `secret`.
- `fetch` avec `AbortController` (timeout 5 s), 1 retry si 5xx.
- Écrit `webhook_deliveries` (statut, durée, erreur éventuelle) + met à jour `last_success_at` / `failure_count` sur le webhook.
- Fire-and-forget côté appelant (`void dispatchWebhooks(...)`) pour ne pas bloquer la réponse au widget.

## 4. UI dashboard

Nouvelle route `src/routes/_authenticated/dashboard.webhooks.tsx` (item ajouté dans `DashboardShell`) :
- Liste des webhooks du projet courant (name, URL masquée, events, statut dernière livraison).
- Formulaire modal ajout/édition : name, URL, cases à cocher pour chaque événement (avec descriptions), toggle actif.
- Bouton "Test" → serverFn `sendTestWebhook(webhookId)` qui envoie un payload factice `webhook.test` et affiche le résultat (status HTTP).
- Bouton "Voir le secret" (révélation temporaire) + "Régénérer le secret".
- Sous-tableau "Dernières livraisons" (10 dernières, event, status, date, erreur si échec).

ServerFns créés (`src/lib/webhooks.functions.ts`) avec `requireSupabaseAuth` :
- `listWebhooks({ projectId })`
- `createWebhook({ projectId, name, url, events })`
- `updateWebhook({ id, patch })`
- `deleteWebhook({ id })`
- `rotateWebhookSecret({ id })`
- `sendTestWebhook({ id })`
- `listRecentDeliveries({ webhookId })`

Chaque fn vérifie que le projet appartient bien au user avant d'agir.

## 5. i18n

Ajouts FR/EN dans `src/lib/i18n.tsx` pour les libellés de la page Webhooks (titres, events, aide Discord, messages d'erreur).

## Fichiers touchés / créés

Créés :
- `supabase/migrations/<ts>_webhooks.sql`
- `src/lib/webhooks.server.ts`
- `src/lib/webhooks.functions.ts`
- `src/routes/_authenticated/dashboard.webhooks.tsx`

Édités :
- `src/routes/api/public/feedbacks.ts` (dispatch après insert)
- `src/routes/api/public/vote.ts` (dispatch après vote)
- `src/routes/_authenticated/dashboard.feature-requests.tsx` (passer la création via serverFn)
- `src/routes/_authenticated/dashboard.changelog.tsx` (passer la publication via serverFn)
- `src/components/dashboard/DashboardShell.tsx` (item de nav "Webhooks")
- `src/lib/i18n.tsx`

## Hors scope

- Retries exponentiels persistants (queue) — on garde 1 retry best-effort.
- Signature Slack native (le format JSON générique passe déjà par Zapier/Make si besoin).
- Rate limiting par webhook.
