# CookLog

A personal recipe tracker — save, organize, and cook from your own recipe
collection. Vite + vanilla JavaScript + Bootstrap 5 on the frontend,
Supabase (Auth, Postgres, Storage) as the backend.

## Contents

- [Project Description](#project-description)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Database Schema](#database-schema)
- [Local Development Setup](#local-development-setup)
- [Key Folders and Files](#key-folders-and-files)
- [Live Demo](#live-demo)

## Project Description

CookLog lets users build a personal collection of recipes — each with a
title, description, image, prep/cook time, servings, a category, a list of
ingredients, and ordered step-by-step instructions.

**Guests** (not signed in) can:
- Browse public recipes on the home feed and open recipe details
- Search by title and filter by category
- Read the About page

**Registered users** can do everything a guest can, plus:
- Register and sign in
- Create, edit, and delete their own recipes
- Mark a recipe as private (hidden from other users' feeds) or public
- Favorite recipes and view them on a dedicated Favorites page
- Switch the home feed between "mine + public" and "mine only"
- Use Cook Mode — a distraction-free, full-step view for cooking, with swipe
  navigation between steps
- Manage their own profile (name, avatar)

**Admins** can do everything a registered user can, plus:
- Create and delete categories
- Promote or demote any user's role
- Edit or delete any user's recipe
- Temporarily restrict or soft-delete a user account (and reverse either)
- View site-wide stats (recipe / user / category counts) on the admin
  dashboard

## Architecture

CookLog is a static frontend that talks directly to Supabase's
auto-generated REST API (PostgREST) — **there is no custom backend server**.
Authentication, database access, and file storage all go through a single
`@supabase/supabase-js` client (initialized once in
[`src/js/supabaseClient.js`](src/js/supabaseClient.js)).

Authorization is enforced by Postgres **Row Level Security** policies (see
[Database Schema](#database-schema)), not by application code — the frontend
does not re-implement ownership or admin checks; it relies on RLS to reject
unauthorized reads/writes.

Vite runs in **multi-page app mode** (`appType: 'mpa'`): every screen is a
real static HTML entry point, not a client-side route. The full list of
pages is declared explicitly in
[`vite.config.js`](vite.config.js#L11-L24):

| Route | Entry point |
|---|---|
| `/` | `index.html` (recipe feed / home) |
| `/src/pages/about.html` | About |
| `/src/pages/login.html` | Login |
| `/src/pages/register.html` | Register |
| `/src/pages/add-recipe.html` | Add recipe |
| `/src/pages/edit-recipe.html` | Edit recipe |
| `/src/pages/recipe-detail.html` | Recipe detail |
| `/src/pages/cook-mode.html` | Cook mode |
| `/src/pages/admin.html` | Admin panel |
| `/src/pages/profile.html` | Profile |
| `/src/pages/favorites.html` | Favorites |
| `/404.html` | Fallback for unmatched routes |

The UI is built with **Bootstrap 5** components (modals, forms, cards,
navbar, alerts, spinners) — no frontend framework (no React/Vue/Angular) and
no client-side router. Each page's companion `.js` module renders dynamic
content with template strings and attaches event listeners directly.

## Tech Stack

| Layer | Technology |
|---|---|
| Build tool / dev server | [Vite](https://vitejs.dev) `^8.1.1` |
| Language | Vanilla JavaScript (ES6+ modules) |
| Markup / styling | HTML5, CSS3, [Bootstrap](https://getbootstrap.com) `^5.3.8` |
| Backend (BaaS) | [Supabase](https://supabase.com) — Auth, Postgres, Storage |
| Supabase client | [`@supabase/supabase-js`](https://github.com/supabase/supabase-js) `^2.110.0` |
| Deployment target | Netlify |

Versions are pinned in [`package.json`](package.json).

## Database Schema

7 tables, all with Row Level Security enabled:

| Table | Purpose |
|---|---|
| `profiles` | 1:1 with `auth.users`; display info plus admin-controlled `restricted_until` / `deleted_at` |
| `user_roles` | Assigns `role` (`user` / `admin`) per user |
| `categories` | Recipe categories — readable by all, writable only by admins |
| `recipes` | A user's recipe: title, description, image, timing, servings, category, `is_private` |
| `ingredients` | Ingredient lines for a recipe |
| `recipe_steps` | Ordered instructions for a recipe |
| `favorites` | Join table for a user's bookmarked recipes |

Relationships: a user owns many `recipes` (cascades on user delete); a
`category` has many `recipes` (nulled, not cascaded, on category delete); a
`recipe` has many `ingredients` and `recipe_steps` (both cascade on recipe
delete); users and recipes have a many-to-many relationship through
`favorites` (cascades on either side, unique per pair).

For the full entity-relationship diagram, column-level detail, and the
reasoning behind a few non-obvious design choices (the dual foreign key on
`recipes.user_id`, the RLS-recursion-safe `is_admin()` helper, foreign-key
indexing), see [`docs/database-schema.md`](docs/database-schema.md). The
schema itself lives in [`supabase/migrations/`](supabase/migrations/) as an
ordered set of SQL migrations — that's the source of truth.

## Local Development Setup

**Prerequisites:** Node.js with npm, and a Supabase project (the free tier
is enough).

1. Clone the repo:
   ```bash
   git clone https://github.com/devdevpy/cooklog-app.git
   cd cooklog-app
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your local env file from the template and fill in your Supabase
   project's URL and anon key (Dashboard → Project Settings → API):
   ```bash
   cp .env.example .env
   ```
   ```
   VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=<your-anon-key>
   ```
4. Link the Supabase CLI to your project and push the migrations — this
   creates all 7 tables, RLS policies, storage buckets, and seed categories:
   ```bash
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push
   ```
5. Start the dev server:
   ```bash
   npm run dev
   ```
   Other available scripts: `npm run build` (production build to `dist/`)
   and `npm run preview` (serve that build locally).
6. There's no UI to create the first admin account — follow
   [`docs/admin-setup.md`](docs/admin-setup.md) to promote a user via SQL.

## Key Folders and Files

| Path | Contents |
|---|---|
| [`src/pages/`](src/pages/) | One HTML entry point + companion `.js` per screen (about, login, register, add-recipe, edit-recipe, recipe-detail, cook-mode, admin, profile, favorites) |
| [`src/js/`](src/js/) | Shared low-level modules: `supabaseClient.js` (the single Supabase client instance), `categories.js`, `recipeForm.js`, `recipesView.js` (card/state HTML templates), `toast.js` |
| [`src/services/`](src/services/) | Data-access layer, one file per Supabase resource (`auth.js`, `profiles.js`, `recipes.js`, `favorites.js`, `admin.js`, `avatarStorage.js`, `storage.js`) — the only layer that calls `supabase.from(...)` / `supabase.auth` directly |
| [`src/components/`](src/components/) | Reusable UI fragments shared across pages: `navbar.js` (auth-aware nav, session/role rendering, account-status enforcement), `back-to-top.js` |
| [`src/css/style.css`](src/css/style.css) | Custom styles layered on top of Bootstrap |
| [`supabase/migrations/`](supabase/migrations/) | The database schema and its full history, as ordered SQL migrations — see [Database Schema](#database-schema) |
| [`scripts/`](scripts/) | One-off Node scripts (e.g. seeding sample recipe images via the Supabase service-role key) — not part of the running app |
| [`docs/`](docs/) | [`admin-setup.md`](docs/admin-setup.md) (bootstrapping the first admin) and [`database-schema.md`](docs/database-schema.md) (ER diagram and schema notes) |

## Live Demo

- **URL:** _TODO: add the deployed Netlify URL_
- **Demo account:** _TODO: add a seeded demo email/password_
- **Admin demo account:** _TODO: add a seeded admin email/password, if one is provided for evaluation_
