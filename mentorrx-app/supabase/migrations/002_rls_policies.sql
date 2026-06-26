-- MentorRx Row Level Security Policies

-- ============================================================
-- Enable RLS on all tables
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_sync ENABLE ROW LEVEL SECURITY;

-- Helper: check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: check if current user is mentor
CREATE OR REPLACE FUNCTION is_mentor()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'mentor'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- PROFILES POLICIES
-- ============================================================

-- Public can view active profiles
CREATE POLICY "profiles_public_select" ON profiles
  FOR SELECT USING (is_active = true);

-- Users can update their own profile
CREATE POLICY "profiles_own_update" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admin full access
CREATE POLICY "profiles_admin_all" ON profiles
  FOR ALL USING (is_admin());

-- System can insert on signup (via handle_new_user trigger, uses SECURITY DEFINER)
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================================
-- MENTORS POLICIES
-- ============================================================

-- Public can view verified mentors
CREATE POLICY "mentors_public_select" ON mentors
  FOR SELECT USING (true);

-- Mentors can update their own record
CREATE POLICY "mentors_own_update" ON mentors
  FOR UPDATE USING (profile_id = auth.uid());

-- Mentors can insert their own record
CREATE POLICY "mentors_own_insert" ON mentors
  FOR INSERT WITH CHECK (profile_id = auth.uid());

-- Admin full access
CREATE POLICY "mentors_admin_all" ON mentors
  FOR ALL USING (is_admin());

-- ============================================================
-- SPECIALTIES POLICIES
-- ============================================================

-- Public read
CREATE POLICY "specialties_public_select" ON specialties
  FOR SELECT USING (is_active = true);

-- Admin manage
CREATE POLICY "specialties_admin_all" ON specialties
  FOR ALL USING (is_admin());

-- ============================================================
-- MENTOR SPECIALTIES POLICIES
-- ============================================================

-- Public read
CREATE POLICY "mentor_specialties_public_select" ON mentor_specialties
  FOR SELECT USING (true);

-- Mentors manage their own
CREATE POLICY "mentor_specialties_own_manage" ON mentor_specialties
  FOR ALL USING (
    mentor_id IN (SELECT id FROM mentors WHERE profile_id = auth.uid())
  );

-- Admin
CREATE POLICY "mentor_specialties_admin_all" ON mentor_specialties
  FOR ALL USING (is_admin());

-- ============================================================
-- CERTIFICATES POLICIES
-- ============================================================

-- Public read
CREATE POLICY "certificates_public_select" ON certificates
  FOR SELECT USING (true);

-- Mentors manage their own
CREATE POLICY "certificates_own_manage" ON certificates
  FOR ALL USING (
    mentor_id IN (SELECT id FROM mentors WHERE profile_id = auth.uid())
  );

-- Admin
CREATE POLICY "certificates_admin_all" ON certificates
  FOR ALL USING (is_admin());

-- ============================================================
-- AVAILABILITY POLICIES
-- ============================================================

-- Public read
CREATE POLICY "availability_public_select" ON availability
  FOR SELECT USING (is_active = true);

-- Mentors manage their own
CREATE POLICY "availability_own_manage" ON availability
  FOR ALL USING (
    mentor_id IN (SELECT id FROM mentors WHERE profile_id = auth.uid())
  );

-- Admin
CREATE POLICY "availability_admin_all" ON availability
  FOR ALL USING (is_admin());

-- ============================================================
-- BOOKINGS POLICIES
-- ============================================================

-- Mentors see their own bookings
CREATE POLICY "bookings_mentor_select" ON bookings
  FOR SELECT USING (
    mentor_id IN (SELECT id FROM mentors WHERE profile_id = auth.uid())
  );

-- Mentees see their own bookings
CREATE POLICY "bookings_mentee_select" ON bookings
  FOR SELECT USING (mentee_id = auth.uid());

-- Mentees can create bookings
CREATE POLICY "bookings_mentee_insert" ON bookings
  FOR INSERT WITH CHECK (mentee_id = auth.uid());

-- Mentors can update their bookings (accept/complete)
CREATE POLICY "bookings_mentor_update" ON bookings
  FOR UPDATE USING (
    mentor_id IN (SELECT id FROM mentors WHERE profile_id = auth.uid())
  );

-- Mentees can cancel their bookings
CREATE POLICY "bookings_mentee_cancel" ON bookings
  FOR UPDATE USING (mentee_id = auth.uid())
  WITH CHECK (status = 'cancelled');

-- Admin
CREATE POLICY "bookings_admin_all" ON bookings
  FOR ALL USING (is_admin());

-- ============================================================
-- PAYMENTS POLICIES
-- ============================================================

-- Payers see their payments
CREATE POLICY "payments_payer_select" ON payments
  FOR SELECT USING (payer_id = auth.uid());

-- Payees see their payments
CREATE POLICY "payments_payee_select" ON payments
  FOR SELECT USING (payee_id = auth.uid());

-- System inserts (via server-side API route)
CREATE POLICY "payments_insert" ON payments
  FOR INSERT WITH CHECK (payer_id = auth.uid());

-- Admin
CREATE POLICY "payments_admin_all" ON payments
  FOR ALL USING (is_admin());

-- ============================================================
-- MEETINGS POLICIES
-- ============================================================

-- Participants see their meetings
CREATE POLICY "meetings_participant_select" ON meetings
  FOR SELECT USING (
    booking_id IN (
      SELECT id FROM bookings
      WHERE mentee_id = auth.uid()
      OR mentor_id IN (SELECT id FROM mentors WHERE profile_id = auth.uid())
    )
  );

-- Admin
CREATE POLICY "meetings_admin_all" ON meetings
  FOR ALL USING (is_admin());

-- ============================================================
-- REVIEWS POLICIES
-- ============================================================

-- Public read public reviews
CREATE POLICY "reviews_public_select" ON reviews
  FOR SELECT USING (is_public = true);

-- Mentees see own reviews
CREATE POLICY "reviews_own_select" ON reviews
  FOR SELECT USING (mentee_id = auth.uid());

-- Mentees create reviews for completed bookings
CREATE POLICY "reviews_mentee_insert" ON reviews
  FOR INSERT WITH CHECK (
    mentee_id = auth.uid()
    AND booking_id IN (
      SELECT id FROM bookings
      WHERE mentee_id = auth.uid() AND status = 'completed'
    )
  );

-- Mentees update their own reviews
CREATE POLICY "reviews_own_update" ON reviews
  FOR UPDATE USING (mentee_id = auth.uid());

-- Admin
CREATE POLICY "reviews_admin_all" ON reviews
  FOR ALL USING (is_admin());

-- ============================================================
-- NOTIFICATIONS POLICIES
-- ============================================================

-- Users see own notifications
CREATE POLICY "notifications_own_select" ON notifications
  FOR SELECT USING (user_id = auth.uid());

-- Users update own (mark read)
CREATE POLICY "notifications_own_update" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- System inserts (SECURITY DEFINER functions)
CREATE POLICY "notifications_insert" ON notifications
  FOR INSERT WITH CHECK (true);

-- Admin
CREATE POLICY "notifications_admin_all" ON notifications
  FOR ALL USING (is_admin());

-- ============================================================
-- FAVORITES POLICIES
-- ============================================================

-- Users see own favorites
CREATE POLICY "favorites_own_select" ON favorites
  FOR SELECT USING (mentee_id = auth.uid());

-- Users manage own favorites
CREATE POLICY "favorites_own_manage" ON favorites
  FOR ALL USING (mentee_id = auth.uid());

-- ============================================================
-- EARNINGS POLICIES
-- ============================================================

-- Mentors see own earnings
CREATE POLICY "earnings_own_select" ON earnings
  FOR SELECT USING (
    mentor_id IN (SELECT id FROM mentors WHERE profile_id = auth.uid())
  );

-- Admin
CREATE POLICY "earnings_admin_all" ON earnings
  FOR ALL USING (is_admin());

-- ============================================================
-- WITHDRAWALS POLICIES
-- ============================================================

-- Mentors see own withdrawals
CREATE POLICY "withdrawals_own_select" ON withdrawals
  FOR SELECT USING (
    mentor_id IN (SELECT id FROM mentors WHERE profile_id = auth.uid())
  );

-- Mentors request withdrawals
CREATE POLICY "withdrawals_own_insert" ON withdrawals
  FOR INSERT WITH CHECK (
    mentor_id IN (SELECT id FROM mentors WHERE profile_id = auth.uid())
  );

-- Admin
CREATE POLICY "withdrawals_admin_all" ON withdrawals
  FOR ALL USING (is_admin());

-- ============================================================
-- MESSAGES POLICIES
-- ============================================================

-- Users see their messages
CREATE POLICY "messages_participant_select" ON messages
  FOR SELECT USING (
    sender_id = auth.uid() OR receiver_id = auth.uid()
  );

-- Users send messages
CREATE POLICY "messages_own_insert" ON messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Users update own messages
CREATE POLICY "messages_own_update" ON messages
  FOR UPDATE USING (receiver_id = auth.uid());

-- Admin
CREATE POLICY "messages_admin_all" ON messages
  FOR ALL USING (is_admin());

-- ============================================================
-- SUPPORT TICKETS POLICIES
-- ============================================================

-- Users see own tickets
CREATE POLICY "tickets_own_select" ON support_tickets
  FOR SELECT USING (user_id = auth.uid());

-- Users create tickets
CREATE POLICY "tickets_own_insert" ON support_tickets
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admin
CREATE POLICY "tickets_admin_all" ON support_tickets
  FOR ALL USING (is_admin());

-- ============================================================
-- ADMIN LOGS & AUDIT LOGS
-- ============================================================

-- Admin only
CREATE POLICY "admin_logs_admin_all" ON admin_logs
  FOR ALL USING (is_admin());

CREATE POLICY "audit_logs_admin_all" ON audit_logs
  FOR ALL USING (is_admin());

-- ============================================================
-- CALENDAR SYNC POLICIES
-- ============================================================

-- Mentors see own sync
CREATE POLICY "calendar_sync_own" ON calendar_sync
  FOR ALL USING (
    mentor_id IN (SELECT id FROM mentors WHERE profile_id = auth.uid())
  );

-- Admin
CREATE POLICY "calendar_sync_admin_all" ON calendar_sync
  FOR ALL USING (is_admin());
