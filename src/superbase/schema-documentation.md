# Supabase Database Schema

This document describes the existing Supabase schema from the SQL definition
provided for this project. It is documentation only; it does not create,
recreate, or modify the live database.

## Extension

- `pgcrypto` is enabled if it is not already installed. The `farms.id` and
  `crop_plots.id` columns use `gen_random_uuid()` as their default.

## `public.profiles`

| Column | Data type | Nullable | Default | Description |
|---|---|---:|---|---|
| `id` | `uuid` | No | — | Profile ID and primary key; references `auth.users(id)`. |
| `full_name` | `text` | No | — | User's full name. |
| `created_at` | `timestamptz` | No | `now()` | Row creation time. |
| `updated_at` | `timestamptz` | No | `now()` | Row update time; the supplied SQL sets an insert default but does not define an update trigger. |

**Primary key:** `id`  
**Foreign keys:** `id` → `auth.users(id)` (`ON DELETE CASCADE`)

Row Level Security (RLS) is enabled. Policies allow users to select, insert,
and update their own profile, with `auth.uid() = id` as the corresponding
access check. No profile delete policy is defined in the supplied SQL.

## `public.farms`

| Column | Data type | Nullable | Default | Description |
|---|---|---:|---|---|
| `id` | `uuid` | No | `gen_random_uuid()` | Farm identifier and primary key. |
| `user_id` | `uuid` | No | — | Owner's Supabase Auth user ID. |
| `name` | `text` | No | — | Farm name. |
| `village` | `text` | No | — | Village name. |
| `district` | `text` | No | — | District name. |
| `location_label` | `text` | No | — | Display label for the farm location. |
| `latitude` | `double precision` | Yes | — | Farm latitude. |
| `longitude` | `double precision` | Yes | — | Farm longitude. |
| `location_consent` | `boolean` | No | `false` | Whether the user consented to use precise coordinates. |
| `location_consent_at` | `timestamptz` | Yes | — | Time precise-location consent was given. |
| `created_at` | `timestamptz` | No | `now()` | Row creation time. |
| `updated_at` | `timestamptz` | No | `now()` | Row update time; the supplied SQL sets an insert default but does not define an update trigger. |

**Primary key:** `id`  
**Foreign keys:** `user_id` → `auth.users(id)` (`ON DELETE CASCADE`)

RLS is enabled. Select, insert, update, and delete policies restrict access to
farms whose `user_id` matches `auth.uid()`. The update policy checks ownership
both for the existing row and the updated row.

## `public.crop_plots`

| Column | Data type | Nullable | Default | Description |
|---|---|---:|---|---|
| `id` | `uuid` | No | `gen_random_uuid()` | Crop-plot identifier and primary key. |
| `farm_id` | `uuid` | No | — | Farm containing this plot. |
| `crop` | `text` | No | — | Crop; restricted to `tomato` or `potato`. |
| `variety` | `text` | Yes | — | Crop variety. |
| `sowing_date` | `date` | No | — | Crop sowing date. |
| `growth_stage` | `text` | No | — | Growth stage; restricted to `seedling`, `vegetative`, `flowering`, or `ripening`. |
| `area_acres` | `numeric` | No | — | Plot area in acres; must be greater than zero. |
| `created_at` | `timestamptz` | No | `now()` | Row creation time. |
| `updated_at` | `timestamptz` | No | `now()` | Row update time; the supplied SQL sets an insert default but does not define an update trigger. |

**Primary key:** `id`  
**Foreign keys:** `farm_id` → `public.farms(id)` (`ON DELETE CASCADE`)  
**Check constraints:** `crop IN ('tomato', 'potato')`;
`growth_stage IN ('seedling', 'vegetative', 'flowering', 'ripening')`;
`area_acres > 0`.

RLS is enabled. Select, insert, update, and delete policies allow access only
when the related farm belongs to the authenticated user (`farms.user_id =
auth.uid()`). The update policy checks ownership for both the existing plot
and its updated row.

## Notes

- `timestamptz` is PostgreSQL's shorthand for `timestamp with time zone`.
- The SQL defines `updated_at` defaults, but does not by itself automatically
  refresh `updated_at` on updates.
- The application references these tables and columns in `src/main.jsx`.
- This document records the supplied schema definition; it does not verify
  whether the live Supabase database currently matches it.
