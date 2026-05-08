# Code review report for Antigravity

Project: `sprzety-budowlane-marketplace`
Date: 2026-05-08
Stack: Next.js 14 App Router, React 18, Supabase SSR, Cloudinary, Tailwind, MapLibre/MapTiler

## Executive summary

Production build passes, so the app is currently compilable. The biggest issues are not syntax-level; they are authorization, RLS policy design, dependency security, and inconsistent data flow between Supabase and the legacy Google Sheets path.

Recommended first pass:

1. Fix Supabase `profiles` RLS so a normal user cannot promote themselves to `admin`.
2. Define and apply admin RLS policies consistently, especially `public.is_admin()` and `company_claims`.
3. Harden dashboard server actions with explicit auth and ownership checks instead of relying only on RLS.
4. Decide what `/api/add-listing` is supposed to do: public moderated submission, authenticated listing creation, or Google Sheets fallback.
5. Upgrade vulnerable dependencies, especially `next`.

## Verification performed

Commands run:

```bash
npm run build
npm audit --omit=dev
```

Result:

- `npm run build` passed after running outside the sandbox. Next generated 28 app routes successfully.
- `npm run lint` is not configured yet. It starts the interactive Next.js ESLint setup prompt.
- `npm audit --omit=dev` reports 3 vulnerabilities: critical in `next`, high in `xlsx`, moderate in nested `postcss`.

## Critical findings

### CRIT-1: Any logged-in user can likely self-promote to admin

File: `supabase_admin_setup.sql`
Lines: 17-19

Current policy:

```sql
CREATE POLICY "Users can update own profile." ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
```

Impact:

A normal authenticated user can update their own `profiles.role` from `user` to `admin` through the Supabase client API, because the policy allows updating the whole row. Since the app checks admin access from `profiles.role`, this can become full admin takeover.

Recommended fix:

- Remove direct user update access to `profiles.role`.
- Do not expose role mutation through a policy that applies to all columns.
- Use an admin-only server action or SQL function for role changes.
- If users need editable profile fields later, split editable profile data into another table or implement a restricted RPC.

Suggested SQL direction:

```sql
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;

CREATE POLICY "Admins can update profiles" ON public.profiles
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
```

### CRIT-2: Admin RLS references `public.is_admin()` but the function is not defined in repo SQL

File: `supabase_admin_setup.sql`
Lines: 45-53

Current policies use:

```sql
FOR ALL USING (public.is_admin());
```

Impact:

If `public.is_admin()` does not already exist in the database, this setup script fails or admin policies are missing. Admin server actions do an app-level role check, but the Supabase request still uses the user session and must pass RLS. This can make admin edits/deletes fail in production, or leave behavior dependent on undocumented DB state.

Recommended fix:

- Add `public.is_admin()` to the SQL setup.
- Make it `SECURITY DEFINER` and avoid recursive RLS surprises.
- Apply admin policies consistently to `companies`, `equipment`, `profiles`, and `company_claims`.

Example direction:

```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;
```

### CRIT-3: Claim admin actions likely cannot work with current `company_claims` RLS

Files:

- `supabase_claims_setup.sql`, lines 19-30
- `app/actions/claimActions.js`, admin reads/updates `company_claims`

Impact:

`company_claims` only has user self-read and self-insert policies. There is no admin SELECT/UPDATE policy in the SQL. `getPendingClaims()` and `handleClaimAction()` check admin in application code, but then query Supabase with the authenticated user's RLS context, not service role. That means admins may not be able to see or approve pending claims unless policies were manually added outside the repo.

Recommended fix:

Add explicit admin policies:

```sql
CREATE POLICY "Admins can view all claims" ON public.company_claims
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update all claims" ON public.company_claims
  FOR UPDATE USING (public.is_admin())
  WITH CHECK (public.is_admin());
```

## High priority findings

### HIGH-1: Dashboard mutations rely too much on RLS and miss explicit ownership checks

Files:

- `app/dashboard/company/actions.js`, lines 49-80 and 83-97
- `app/dashboard/equipment/actions.js`, lines 77-145

Impact:

`updateCompany()` and `deleteCompany()` do not call `auth.getUser()` or verify `owner_user_id` in application code. Equipment update/delete uses client-provided `companyId` and relies on RLS. RLS is important, but server actions should also verify ownership because they are callable endpoints.

Recommended fix:

- In every dashboard mutation, get the current user.
- Fetch the target record with owner relation.
- Return/throw unauthorized if the record is not owned by that user.
- Keep RLS as a second layer.

### HIGH-2: Public `/api/add-listing` accepts unauthenticated uploads and returns success even when Supabase fails

File: `app/api/add-listing/route.js`
Lines: 4-142

Impact:

This endpoint accepts public form submissions, uploads images to Cloudinary, attempts Supabase writes, catches Supabase errors, optionally sends data to Google Sheets, and still returns `{ success: true }`. The form copy says listings are moderated, but the Supabase path inserts `status: 'active'`.

Risks:

- Spam submissions.
- Cloudinary storage abuse.
- Users see success even if nothing was saved.
- Public listings may bypass moderation if Supabase insert ever succeeds.
- Data model is inconsistent: `promotion` is written as strings `'Mozliwe'/'Nie'` here but booleans elsewhere.

Recommended fix:

- Add rate limiting and server-side validation.
- Validate image type and size before upload.
- Use `status: 'pending'` for public submissions.
- Return an error if both Supabase and Google Sheets fail.
- Normalize `promotion` to one DB type.
- Consider requiring login, or create a dedicated `listing_submissions` table for public moderation.

### HIGH-3: Dependency audit reports critical/high vulnerabilities

File: `package.json`

Audit result:

- `next@14.2.3` is flagged critical by `npm audit`.
- `xlsx` is flagged high and has no fix available.
- nested `postcss` is flagged moderate through Next dependency tree.

Recommended fix:

- Upgrade Next in the 14.x line first, for example to the audited fix target suggested by npm: `next@14.2.35`.
- Re-run `npm run build`.
- Remove `xlsx` if it is not needed at runtime. Current search found only `read_headers.js` using `xlsx`, and that script references a non-tracked `baza_wynajem_ulepszona.xlsx`.
- If XLSX import is still needed, isolate it as a dev-only script dependency or replace it with CSV/PapaParse flow.

## Medium priority findings

### MED-1: Admin delete action accepts a table name from the client

File: `app/admin/actions.js`
Lines: 56-65

Impact:

The UI currently calls this with only `companies` or `equipment`, but the server action itself accepts arbitrary `table`. If another client invokes the server action directly, it can attempt deletes against any table the admin RLS context permits.

Recommended fix:

Use an allowlist:

```js
const DELETABLE_TABLES = new Set(['companies', 'equipment'])
if (!DELETABLE_TABLES.has(table)) throw new Error('Invalid table')
```

Even better: split into `adminDeleteCompany(id)` and `adminDeleteEquipment(id)`.

### MED-2: App has no configured lint command

File: `package.json`

Current `npm run lint` invokes `next lint`, which opens the interactive setup prompt.

Recommended fix:

- Add `.eslintrc.json` or migrate to direct ESLint config.
- Make `npm run lint` non-interactive for CI and agents.

Example:

```json
{
  "extends": ["next/core-web-vitals"]
}
```

### MED-3: Public profiles are fully selectable

File: `supabase_admin_setup.sql`
Lines: 13-15

Impact:

All users can select all profile rows. Today the table is small, but it exposes user UUIDs and roles. It also supports the current app-side admin check, so changing it requires care.

Recommended fix:

- Restrict public profile reads to own row.
- Add admin-only select policy.
- Keep admin checks inside server-side code or an RPC.

### MED-4: Cache invalidation is inconsistent with public listing cache

File: `lib/googleSheets.js`
Lines: 202-219

The public marketplace data is cached with tag `listings` and `revalidate: 60`, but mutations mainly call `revalidatePath()` and do not call `revalidateTag('listings')`.

Impact:

After admin/dashboard changes, public listing pages may remain stale until cache TTL expires.

Recommended fix:

- Import `revalidateTag` in listing mutation actions.
- Call `revalidateTag('listings')` after create/update/delete/status changes.

## Architecture notes

The project is in a transition state between CSV/Google Sheets and Supabase:

- `lib/googleSheets.js` actually reads Supabase first, then local CSV fallback.
- `/api/add-listing` still writes to Google Sheets as a fallback.
- `scripts/migrate-to-supabase.js` uses service role and CSV data.

This is workable short-term, but it makes debugging hard. Pick a source-of-truth strategy:

1. Supabase-only runtime, CSV only for migration/backup.
2. Public submissions go to a `listing_submissions` table, then admin promotes them to `companies/equipment`.
3. Google Sheets integration removed from the production write path.

## Suggested Antigravity task list

Use these as implementation tasks:

1. Patch Supabase SQL security:
   - Define `public.is_admin()`.
   - Remove user self-update of `profiles.role`.
   - Add admin policies for `profiles`, `companies`, `equipment`, `company_claims`.
   - Add `WITH CHECK` where updates/inserts are allowed.

2. Harden dashboard actions:
   - Add `getUser()` to `updateCompany`, `deleteCompany`, `updateEquipment`, `deleteEquipment`.
   - Verify ownership server-side before mutating.
   - Keep RLS in place as defense in depth.

3. Redesign public listing submission:
   - Validate all fields server-side.
   - Validate upload MIME and size before Cloudinary upload.
   - Use `pending` status for public submissions.
   - Return failure if persistence fails.
   - Normalize `promotion` type.

4. Fix admin action surface:
   - Replace `adminDeleteRecord(table, id)` with explicit delete functions or a strict allowlist.
   - Validate `role`, `status`, UUIDs, URLs, and numeric prices before database writes.

5. Dependency maintenance:
   - Upgrade `next` to a patched 14.x release.
   - Remove or isolate `xlsx`.
   - Re-run `npm audit --omit=dev` and `npm run build`.

6. Tooling:
   - Add non-interactive ESLint config.
   - Add at least smoke tests for auth/ownership server actions.

## Build output snapshot

The production build generated routes successfully, including:

- `/`
- `/admin/*`
- `/dashboard/*`
- `/api/add-listing`
- `/api/geocode`
- `/oferta/[slug]`
- `/blog/[slug]`
- `/sitemap.xml`
- `/robots.txt`

No TypeScript check is present because the project is JavaScript-only.

