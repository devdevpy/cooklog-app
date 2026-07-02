---
trigger: always_on
---
# CookLog (RecipeVault) — Agent Instructions

## Project Overview
CookLog is a personal recipe tracker web application. Users can create, view, edit, and delete their own recipes (with images, ingredients, and step-by-step instructions), organize recipes by category, search and filter the recipe list, and manage their profile. Admin users can manage categories and user roles through an admin panel.

## Tech Stack
- Vanilla JavaScript (ES6+ modules) — no frontend framework (no React, Vue, or Angular)
- HTML5 and CSS3
- Bootstrap 5 (CSS + bundled JS) — always prefer existing Bootstrap components (modals, forms, cards, navbar, alerts, spinners) over building custom UI from scratch
- Vite as the build tool and dev server
- Supabase for Auth, Postgres Database, and Storage (recipe images)
- Deployment target: Netlify or Vercel

## Folder Structure
- `src/js/` — JS modules grouped by concern (e.g. `auth.js`, `recipes.js`, `categories.js`, `supabaseClient.js`, `ui.js`)
- `src/css/` — custom styles that extend Bootstrap, kept minimal
- `src/assets/` — static assets
- One HTML entry point per screen/view at root level or `src/pages/`

## Supabase Rules
- Initialize the Supabase client once in `src/js/supabaseClient.js` and import it wherever needed — never re-initialize elsewhere
- Store Supabase URL and anon key in `.env` using Vite env variables (`import.meta.env.VITE_SUPABASE_URL`, `import.meta.env.VITE_SUPABASE_ANON_KEY`)
- `.env` must always be in `.gitignore` — never hardcode credentials in source files
- All six tables have Row Level Security (RLS) enabled — never disable or bypass RLS

## Database Schema (Supabase Postgres)
Six tables:
- `profiles` — linked 1:1 to auth.users
- `user_roles` — assigns role (user/admin) per user
- `categories` — readable by all, writable only by admins
- `recipes` — owned by a user, linked to a category
- `ingredients` — linked to a recipe
- `recipe_steps` — ordered steps linked to a recipe

## Coding Conventions
- ES6+ syntax: `async/await`, `const`/`let`, arrow functions, template literals
- camelCase for variables and functions
- One responsibility per JS module/file
- All Supabase calls must have explicit error handling with user-facing feedback via Bootstrap alerts or toasts — no silent failures
- Reuse Bootstrap utility classes before writing any custom CSS
- Keep HTML semantic and accessible (proper labels, alt text on images, aria attributes where relevant)

## Git Conventions
- Commit often with clear messages using Conventional Commits format (e.g. `feat: add recipe edit form`, `fix: correct RLS policy for ingredients`)
- Each phase of work should produce multiple small commits, not one large commit
- Never commit `.env` or any file containing secrets

## Do's and Don'ts
- Do not introduce any frontend framework or state-management library
- Do not duplicate the Supabase client initialization
- Do not disable RLS policies for any reason
- Always verify a feature works end-to-end (UI → Supabase → UI update) before considering it done