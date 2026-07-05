# Bootstrapping the first admin

There is no UI to promote a user to admin — the admin panel itself
(`/src/pages/admin.html`) requires an existing admin to sign in, and role
toggling there only works once at least one admin exists. To create the
first admin, set their role directly in the database.

## Steps

1. Register a normal account through the app (or use one that already
   exists) and note its email address.
2. Open the [Supabase dashboard](https://supabase.com/dashboard) for this
   project, then go to **SQL Editor**.
3. Find the user's id from `auth.users` by email:

   ```sql
   select id, email from auth.users where email = 'you@example.com';
   ```

4. Every user gets a row in `user_roles` automatically on signup (role
   `'user'`, via the `handle_new_user` trigger). Promote that row to admin:

   ```sql
   update user_roles
   set role = 'admin'
   where user_id = '<uuid-from-step-3>';
   ```

   If the row doesn't exist for some reason, insert it instead:

   ```sql
   insert into user_roles (user_id, role)
   values ('<uuid-from-step-3>', 'admin');
   ```

5. Sign out and back in (or just refresh) so the app picks up the new
   role. The "Admin" link should now appear in the navbar, and
   `/src/pages/admin.html` will grant access.

From here, that admin can promote or demote any other user's role from
the **Manage users** table in the admin panel — no more manual SQL needed.
