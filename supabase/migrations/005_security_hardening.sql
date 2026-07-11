-- MentorRx Migration 005
-- Security hardening based on Supabase advisor findings:
--  1. mentor_profiles view: run as invoker (not the view creator) so RLS
--     applies to the querying user, not the view owner.
--  2. Pin search_path on all SECURITY DEFINER / STABLE functions to prevent
--     search_path hijacking.
--  3. Remove the overly-permissive notifications INSERT policy — all real
--     inserts happen server-side via the service-role client (which bypasses
--     RLS), so no client role needs direct INSERT access.
--  4. Revoke direct RPC execution on trigger-only functions that were never
--     meant to be called outside their trigger context.

-- ============================================================
-- 1. mentor_profiles view — security invoker
-- ============================================================

ALTER VIEW mentor_profiles SET (security_invoker = true);

-- ============================================================
-- 2. Pin search_path on functions
-- ============================================================

ALTER FUNCTION update_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION handle_new_user() SET search_path = public, pg_temp;
ALTER FUNCTION update_mentor_rating() SET search_path = public, pg_temp;
ALTER FUNCTION update_mentor_sessions() SET search_path = public, pg_temp;
ALTER FUNCTION get_available_slots(UUID, DATE) SET search_path = public, pg_temp;
ALTER FUNCTION is_admin() SET search_path = public, pg_temp;
ALTER FUNCTION is_mentor() SET search_path = public, pg_temp;

-- ============================================================
-- 3. Remove overly-permissive notifications INSERT policy
-- ============================================================

DROP POLICY IF EXISTS "notifications_insert" ON notifications;

-- ============================================================
-- 4. Revoke direct RPC execution on trigger-only functions
-- ============================================================

REVOKE EXECUTE ON FUNCTION update_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION update_mentor_rating() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION update_mentor_sessions() FROM PUBLIC, anon, authenticated;
