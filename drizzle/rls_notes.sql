-- RLS intent notes (apply in Supabase SQL editor after drizzle migrate).
-- Completions are the immutable asset: service_role only.
-- Workspace-scoped tables: members see only their workspace rows.

-- Example (not auto-applied):
-- ALTER TABLE completions ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY completions_service_only ON completions
--   FOR ALL USING (auth.role() = 'service_role');
