-- MentorRx Migration 003
-- Adds: payouts table, availability_exceptions table,
--        Realtime publication, Storage buckets + policies

-- ============================================================
-- PAYOUTS
-- ============================================================

CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'SAR',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  payout_method TEXT NOT NULL,
  reference_id TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payouts_mentor ON payouts(mentor_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);

CREATE TRIGGER trg_payouts_updated_at
  BEFORE UPDATE ON payouts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payouts_own_select" ON payouts
  FOR SELECT USING (
    mentor_id IN (SELECT id FROM mentors WHERE profile_id = auth.uid())
  );

CREATE POLICY "payouts_own_insert" ON payouts
  FOR INSERT WITH CHECK (
    mentor_id IN (SELECT id FROM mentors WHERE profile_id = auth.uid())
  );

CREATE POLICY "payouts_admin_all" ON payouts
  FOR ALL USING (is_admin());

-- ============================================================
-- AVAILABILITY EXCEPTIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS availability_exceptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  exception_date DATE NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT false,
  start_time TIME,
  end_time TIME,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(mentor_id, exception_date)
);

CREATE INDEX IF NOT EXISTS idx_avail_exceptions_mentor ON availability_exceptions(mentor_id);
CREATE INDEX IF NOT EXISTS idx_avail_exceptions_date ON availability_exceptions(exception_date);

CREATE TRIGGER trg_availability_exceptions_updated_at
  BEFORE UPDATE ON availability_exceptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE availability_exceptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "avail_exceptions_public_select" ON availability_exceptions
  FOR SELECT USING (true);

CREATE POLICY "avail_exceptions_own_manage" ON availability_exceptions
  FOR ALL USING (
    mentor_id IN (SELECT id FROM mentors WHERE profile_id = auth.uid())
  );

CREATE POLICY "avail_exceptions_admin_all" ON availability_exceptions
  FOR ALL USING (is_admin());

-- ============================================================
-- NOTIFICATIONS DELETE POLICY (needed for notifications-view.tsx)
-- ============================================================

CREATE POLICY "notifications_own_delete" ON notifications
  FOR DELETE USING (user_id = auth.uid());

-- ============================================================
-- REALTIME — enable on key tables
-- ============================================================

-- Add tables to the supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- ============================================================
-- STORAGE BUCKETS
-- (Run these in the Supabase Dashboard SQL editor or via API —
--  storage bucket creation is not always available in plain SQL.
--  The equivalent dashboard steps are listed as comments.)
-- ============================================================

-- Create buckets via the storage API (these INSERT statements
-- work in Supabase's SQL editor when run as service role):
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('mentor-images', 'mentor-images', true, 5242880,
    ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('certificates',  'certificates',  false, 10485760,
    ARRAY['application/pdf','image/jpeg','image/png']),
  ('cv-files',      'cv-files',      false, 10485760,
    ARRAY['application/pdf','application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: mentor-images (public read, owner write)
CREATE POLICY "mentor_images_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'mentor-images');

CREATE POLICY "mentor_images_owner_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'mentor-images'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

CREATE POLICY "mentor_images_owner_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'mentor-images'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

CREATE POLICY "mentor_images_owner_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'mentor-images'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

-- Storage RLS: certificates (owner only)
CREATE POLICY "certificates_owner_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'certificates'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

CREATE POLICY "certificates_owner_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'certificates'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

CREATE POLICY "certificates_owner_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'certificates'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

-- Storage RLS: cv-files (owner only)
CREATE POLICY "cv_files_owner_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'cv-files'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

CREATE POLICY "cv_files_owner_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'cv-files'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

CREATE POLICY "cv_files_owner_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'cv-files'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );
