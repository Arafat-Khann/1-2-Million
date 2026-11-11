# Supabase Row Level Security Policies

Row Level Security (RLS) controls which records an authenticated user can access.
This document describes the policies in the Supabase SQL supplied for this
project. It documents the intended configuration; it does not change or verify
the live Supabase database.

All policies below use PostgreSQL's default `PUBLIC` role because the SQL does
not specify a `TO` clause. They are permissive policies (the PostgreSQL
default). Access conditions use `auth.uid()` to scope rows to the signed-in
user.

## `public.profiles`

### Users can view own profile

- **Operation:** `SELECT`
- **Role:** `PUBLIC`
- **Purpose:** Allows a user to read a profile only when its `id` matches their
  authenticated user ID.
- **Using:** `auth.uid() = id`

### Users can create own profile

- **Operation:** `INSERT`
- **Role:** `PUBLIC`
- **Purpose:** Allows inserting a profile only when its `id` matches the
  authenticated user ID.
- **With check:** `auth.uid() = id`

### Users can update own profile

- **Operation:** `UPDATE`
- **Role:** `PUBLIC`
- **Purpose:** Allows updating a profile only when the existing and resulting
  row belong to the authenticated user.
- **Using:** `auth.uid() = id`
- **With check:** `auth.uid() = id`

There is no profile `DELETE` policy in the supplied SQL.

## `public.farms`

### Users can view own farms

- **Operation:** `SELECT`
- **Role:** `PUBLIC`
- **Purpose:** Allows users to read only farms they own.
- **Using:** `auth.uid() = user_id`

### Users can create own farms

- **Operation:** `INSERT`
- **Role:** `PUBLIC`
- **Purpose:** Allows inserting a farm only when its `user_id` is the
  authenticated user's ID.
- **With check:** `auth.uid() = user_id`

### Users can update own farms

- **Operation:** `UPDATE`
- **Role:** `PUBLIC`
- **Purpose:** Allows updating only farms owned by the authenticated user and
  prevents changing ownership to another user.
- **Using:** `auth.uid() = user_id`
- **With check:** `auth.uid() = user_id`

### Users can delete own farms

- **Operation:** `DELETE`
- **Role:** `PUBLIC`
- **Purpose:** Allows deleting only farms owned by the authenticated user.
- **Using:** `auth.uid() = user_id`

## `public.crop_plots`

For these policies, ownership is determined through the related farm: a plot
belongs to the current user only if a farm with `farms.id = crop_plots.farm_id`
has `farms.user_id = auth.uid()`.

### Users can view own crop plots

- **Operation:** `SELECT`
- **Role:** `PUBLIC`
- **Purpose:** Allows reading plots only when their related farm belongs to the
  authenticated user.
- **Using:**

  ```sql
  exists (
    select 1
    from public.farms
    where farms.id = crop_plots.farm_id
      and farms.user_id = auth.uid()
  )
  ```

### Users can create own crop plots

- **Operation:** `INSERT`
- **Role:** `PUBLIC`
- **Purpose:** Allows inserting a plot only when its related farm belongs to
  the authenticated user.
- **With check:**

  ```sql
  exists (
    select 1
    from public.farms
    where farms.id = crop_plots.farm_id
      and farms.user_id = auth.uid()
  )
  ```

### Users can update own crop plots

- **Operation:** `UPDATE`
- **Role:** `PUBLIC`
- **Purpose:** Allows updating a plot only when its existing and resulting
  `farm_id` refer to farms owned by the authenticated user.
- **Using:** Checks the related farm ownership for the existing row using the
  `exists` condition above.
- **With check:** Checks the related farm ownership for the updated row using
  the same `exists` condition.

### Users can delete own crop plots

- **Operation:** `DELETE`
- **Role:** `PUBLIC`
- **Purpose:** Allows deleting a plot only when its related farm belongs to the
  authenticated user.
- **Using:** Checks the related farm ownership using the `exists` condition
  above.

## Security notes

- RLS is enabled on `public.profiles`, `public.farms`, and
  `public.crop_plots` in the supplied SQL.
- The policies limit rows by ownership, but policies do not grant SQL table
  privileges by themselves. Supabase roles still need appropriate grants.
- The frontend's Supabase publishable/anon key is not a secret. Do not expose
  service-role keys, database passwords, or other privileged credentials in
  frontend code or repository files.
- Test with at least two ordinary user accounts: each should access their own
  records and be unable to read, create for, update, or delete another user's
  records. Also check unauthenticated access.
- The `crop_plots` policies query `public.farms`; confirm that the relevant
  database roles have the permissions required for the policy subquery to work
  in the deployed Supabase configuration.
- Cascading foreign-key deletes may remove child crop plots when an owned farm
  is deleted. This follows the schema's `ON DELETE CASCADE`, not a separate
  crop-plot delete policy.
- No `terms` table or policies for it appear in the SQL supplied for this
  project's schema; verify separately if such a table exists in the live
  project.

## Verify the policies in Supabase

No additional screenshot is needed to document the policies in the SQL you
provided. To confirm that the live project matches this documentation:

1. Sign in to the [Supabase Dashboard](https://supabase.com/dashboard) and open
   the project used by this application.
2. Open **Database** → **Tables** (in some Dashboard layouts, use **Table
   Editor**).
3. Select `profiles`, `farms`, then `crop_plots` in the `public` schema.
4. Open each table's **Policies** / **RLS policies** panel.
5. Confirm RLS is enabled and compare each policy's name, command, target role,
   `USING` expression, and `WITH CHECK` expression with the entries above.
6. If anything differs, share screenshots showing the complete policy list and
   each policy's details (especially the role and both expressions) or export
   the live policy SQL. Redact project credentials and tokens; they are not
   needed for verification.