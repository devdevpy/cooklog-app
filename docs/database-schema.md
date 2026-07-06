# Database schema

Source of truth: [`supabase/migrations/`](../supabase/migrations/), applied in filename order.
This diagram and the table notes below are a snapshot of that history — if they
ever disagree with the migrations, the migrations are correct.

## Entity-relationship diagram

```mermaid
erDiagram
    auth_users {
        uuid id PK
        text email
    }
    profiles {
        uuid id PK "FK -> auth_users.id, ON DELETE CASCADE"
        text full_name
        text avatar_url
        timestamptz restricted_until "admin-set, temporary restriction"
        timestamptz deleted_at "admin-set, soft delete"
        timestamptz created_at
    }
    user_roles {
        uuid id PK
        uuid user_id FK "-> auth_users.id, UNIQUE, ON DELETE CASCADE"
        text role "'user' | 'admin'"
        timestamptz created_at
    }
    categories {
        uuid id PK
        text name "UNIQUE"
        timestamptz created_at
    }
    recipes {
        uuid id PK
        uuid user_id FK "-> auth_users.id AND profiles.id, ON DELETE CASCADE"
        uuid category_id FK "-> categories.id, ON DELETE SET NULL"
        text title
        text description
        text image_url
        int prep_time
        int cook_time
        int servings
        boolean is_private
        timestamptz created_at
        timestamptz updated_at
    }
    ingredients {
        uuid id PK
        uuid recipe_id FK "-> recipes.id, ON DELETE CASCADE"
        text name
        text amount
        text unit
        int sort_order
    }
    recipe_steps {
        uuid id PK
        uuid recipe_id FK "-> recipes.id, ON DELETE CASCADE"
        int step_number
        text description
    }
    favorites {
        uuid id PK
        uuid user_id FK "-> auth_users.id, ON DELETE CASCADE"
        uuid recipe_id FK "-> recipes.id, ON DELETE CASCADE"
        timestamptz created_at "UNIQUE(user_id, recipe_id)"
    }

    auth_users ||--|| profiles         : "id"
    auth_users ||--|| user_roles       : "user_id"
    auth_users ||--o{ recipes          : "user_id"
    profiles   ||--o{ recipes          : "user_id (author embed)"
    auth_users ||--o{ favorites        : "user_id"
    categories ||--o{ recipes          : "category_id"
    recipes    ||--o{ ingredients      : "recipe_id"
    recipes    ||--o{ recipe_steps     : "recipe_id"
    recipes    ||--o{ favorites        : "recipe_id"
```

`auth_users` represents Supabase's built-in `auth.users` table — it's managed by
Supabase Auth, not by a migration in this repo.

## Tables

| Table | Purpose |
|---|---|
| `profiles` | One row per user, 1:1 with `auth.users`. Created automatically by the `handle_new_user` trigger on signup. Holds display info (`full_name`, `avatar_url`) plus admin-controlled account status (`restricted_until`, `deleted_at`) — see [admin-setup.md](./admin-setup.md). |
| `user_roles` | One row per user, assigns `role` (`'user'` or `'admin'`), also created by `handle_new_user`. Read via the `public.is_admin()` `SECURITY DEFINER` helper to avoid recursive RLS checks. |
| `categories` | Recipe categories (Breakfast, Dinner, ...). Readable by everyone, writable only by admins. |
| `recipes` | A user-authored recipe: title, description, image, timing, servings, category, and `is_private` (hide from other users' feeds). |
| `ingredients` | Ingredient lines for a recipe, ordered by `sort_order`. Deleted along with the recipe. |
| `recipe_steps` | Ordered instructions for a recipe (`step_number`). Deleted along with the recipe. |
| `favorites` | Join table letting a user bookmark a recipe. `UNIQUE(user_id, recipe_id)` prevents duplicate favorites; both FKs cascade on delete. |

## Notable design details

- **`recipes.user_id` has two foreign keys** — one to `auth.users(id)` (the
  original ownership FK) and one to `profiles(id)` (added later, see
  [20260702000003](../supabase/migrations/20260702000003_public_read_and_author_fk.sql)).
  Both are safe because `profiles.id` always equals the owning `auth.users.id`;
  the second FK exists purely so PostgREST can embed `profiles(...)` (the
  recipe author) in a single `recipes` query.
- **Admin checks avoid RLS recursion** via `public.is_admin()`, a
  `SECURITY DEFINER` function that reads `user_roles` bypassing RLS (see
  [20260702000004](../supabase/migrations/20260702000004_fix_user_roles_recursion.sql)).
  A naive policy that queries `user_roles` from inside a `user_roles` policy
  causes Postgres error `42P17` (infinite recursion) — use `is_admin()`
  instead of inlining that subquery in any new policy.
- **Row Level Security is enabled on all 7 tables.** Every table's access
  rules live in `supabase/migrations/`, not in application code — the
  frontend has no authorization logic of its own; it relies on RLS to
  enforce ownership and admin checks.
- **Indexes**: besides the automatic indexes on primary keys and unique
  constraints, `recipes(user_id)`, `recipes(category_id)`,
  `ingredients(recipe_id)`, `recipe_steps(recipe_id)`, and
  `favorites(recipe_id)` are explicitly indexed (see
  [20260706000003](../supabase/migrations/20260706000003_add_missing_indexes.sql))
  since Postgres does not index foreign key columns automatically.
- **Storage**: two public buckets, `recipe-images` and `avatars`, each with
  owner-scoped upload/update/delete policies keyed on the first path segment
  (`storage.foldername(name)[1] = auth.uid()::text`) and public read access.
