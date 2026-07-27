-- RLS policies for AVT tables (applied on Supabase project cuyxhvodngyzasqdsdjm).
-- Completions: service_role only (immutable raw asset).
-- Other tables: service_role full access via server DATABASE_URL / service role.
-- reports: anon can SELECT where status = 'ready' (shareable free reports).
-- workspace_members: users can SELECT their own membership rows.

-- Reminder: enabling RLS without policies blocks PostgREST. Always add policies
-- before relying on the anon/authenticated keys from the browser.
