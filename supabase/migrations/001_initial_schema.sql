-- MentorRx Initial Schema
-- Run this in your Supabase SQL editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('mentee', 'mentor', 'admin');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'no_show');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');
CREATE TYPE payment_provider AS ENUM ('hyperpay', 'stripe');
CREATE TYPE video_provider AS ENUM ('zoom', 'teams', 'google_meet');
CREATE TYPE meeting_status AS ENUM ('scheduled', 'started', 'completed', 'cancelled');
CREATE TYPE notification_type AS ENUM (
  'booking_confirmed', 'booking_cancelled', 'booking_reminder',
  'payment_received', 'meeting_starting', 'review_request',
  'message_received', 'payout_processed'
);
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE earning_status AS ENUM ('pending', 'available', 'withdrawn');
CREATE TYPE withdrawal_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE calendar_provider AS ENUM ('google', 'outlook', 'apple');

-- ============================================================
-- PROFILES
-- ============================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'mentee',
  phone TEXT,
  country TEXT,
  timezone TEXT DEFAULT 'UTC',
  bio TEXT,
  linkedin_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_country ON profiles(country);

-- ============================================================
-- SPECIALTIES
-- ============================================================

CREATE TABLE specialties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  category TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_specialties_slug ON specialties(slug);
CREATE INDEX idx_specialties_category ON specialties(category);

-- ============================================================
-- MENTORS
-- ============================================================

CREATE TABLE mentors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  headline TEXT,
  current_company TEXT,
  current_title TEXT,
  years_experience INTEGER CHECK (years_experience >= 0),
  hourly_rate DECIMAL(10, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'SAR',
  languages TEXT[] NOT NULL DEFAULT ARRAY['English'],
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_accepting_bookings BOOLEAN NOT NULL DEFAULT true,
  cover_image_url TEXT,
  total_sessions INTEGER NOT NULL DEFAULT 0,
  total_reviews INTEGER NOT NULL DEFAULT 0,
  average_rating DECIMAL(3, 2) NOT NULL DEFAULT 0,
  stripe_account_id TEXT,
  hyperpay_account_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mentors_profile_id ON mentors(profile_id);
CREATE INDEX idx_mentors_is_verified ON mentors(is_verified);
CREATE INDEX idx_mentors_is_featured ON mentors(is_featured);
CREATE INDEX idx_mentors_is_accepting ON mentors(is_accepting_bookings);
CREATE INDEX idx_mentors_hourly_rate ON mentors(hourly_rate);
CREATE INDEX idx_mentors_average_rating ON mentors(average_rating);

-- ============================================================
-- MENTOR SPECIALTIES
-- ============================================================

CREATE TABLE mentor_specialties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  specialty_id UUID NOT NULL REFERENCES specialties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(mentor_id, specialty_id)
);

CREATE INDEX idx_mentor_specialties_mentor ON mentor_specialties(mentor_id);
CREATE INDEX idx_mentor_specialties_specialty ON mentor_specialties(specialty_id);

-- ============================================================
-- CERTIFICATES
-- ============================================================

CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  issuer TEXT NOT NULL,
  issued_at DATE,
  expires_at DATE,
  credential_url TEXT,
  file_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_certificates_mentor ON certificates(mentor_id);

-- ============================================================
-- AVAILABILITY
-- ============================================================

CREATE TABLE availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (start_time < end_time),
  UNIQUE(mentor_id, day_of_week, start_time, end_time)
);

CREATE INDEX idx_availability_mentor ON availability(mentor_id);
CREATE INDEX idx_availability_day ON availability(day_of_week);

-- ============================================================
-- BOOKINGS
-- ============================================================

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID NOT NULL REFERENCES mentors(id),
  mentee_id UUID NOT NULL REFERENCES profiles(id),
  specialty_id UUID REFERENCES specialties(id),
  status booking_status NOT NULL DEFAULT 'pending',
  session_date DATE NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes IN (30, 60, 90, 120)),
  title TEXT,
  notes TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'SAR',
  payment_status payment_status NOT NULL DEFAULT 'pending',
  payment_id UUID,
  meeting_id UUID,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (start_time < end_time),
  CHECK (mentor_id::TEXT != mentee_id::TEXT)
);

CREATE INDEX idx_bookings_mentor ON bookings(mentor_id);
CREATE INDEX idx_bookings_mentee ON bookings(mentee_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_session_date ON bookings(session_date);
CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX idx_bookings_start_time ON bookings(start_time);

-- Prevent double-booking
CREATE UNIQUE INDEX idx_bookings_no_overlap
  ON bookings(mentor_id, start_time, end_time)
  WHERE status NOT IN ('cancelled', 'no_show');

-- ============================================================
-- PAYMENTS
-- ============================================================

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  payer_id UUID NOT NULL REFERENCES profiles(id),
  payee_id UUID NOT NULL REFERENCES profiles(id),
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'SAR',
  platform_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
  net_amount DECIMAL(10, 2) NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  provider payment_provider NOT NULL DEFAULT 'hyperpay',
  provider_payment_id TEXT,
  provider_response JSONB,
  invoice_url TEXT,
  refunded_at TIMESTAMPTZ,
  refund_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_payer ON payments(payer_id);
CREATE INDEX idx_payments_payee ON payments(payee_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_provider ON payments(provider);

-- Link back
ALTER TABLE bookings ADD CONSTRAINT fk_bookings_payment
  FOREIGN KEY (payment_id) REFERENCES payments(id);

-- ============================================================
-- MEETINGS
-- ============================================================

CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  provider video_provider NOT NULL DEFAULT 'zoom',
  provider_meeting_id TEXT,
  meeting_url TEXT NOT NULL,
  host_url TEXT,
  password TEXT,
  status meeting_status NOT NULL DEFAULT 'scheduled',
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  actual_start_time TIMESTAMPTZ,
  actual_end_time TIMESTAMPTZ,
  recording_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_meetings_booking ON meetings(booking_id);
CREATE INDEX idx_meetings_status ON meetings(status);
CREATE INDEX idx_meetings_start_time ON meetings(start_time);

-- Link back
ALTER TABLE bookings ADD CONSTRAINT fk_bookings_meeting
  FOREIGN KEY (meeting_id) REFERENCES meetings(id);

-- ============================================================
-- REVIEWS
-- ============================================================

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES mentors(id),
  mentee_id UUID NOT NULL REFERENCES profiles(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_mentor ON reviews(mentor_id);
CREATE INDEX idx_reviews_mentee ON reviews(mentee_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- ============================================================
-- FAVORITES
-- ============================================================

CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(mentee_id, mentor_id)
);

CREATE INDEX idx_favorites_mentee ON favorites(mentee_id);
CREATE INDEX idx_favorites_mentor ON favorites(mentor_id);

-- ============================================================
-- EARNINGS
-- ============================================================

CREATE TABLE earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES bookings(id),
  payment_id UUID NOT NULL REFERENCES payments(id),
  gross_amount DECIMAL(10, 2) NOT NULL,
  platform_fee DECIMAL(10, 2) NOT NULL,
  net_amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'SAR',
  status earning_status NOT NULL DEFAULT 'pending',
  available_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_earnings_mentor ON earnings(mentor_id);
CREATE INDEX idx_earnings_status ON earnings(status);

-- ============================================================
-- WITHDRAWALS
-- ============================================================

CREATE TABLE withdrawals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'SAR',
  status withdrawal_status NOT NULL DEFAULT 'pending',
  bank_details JSONB,
  provider_transfer_id TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_withdrawals_mentor ON withdrawals(mentor_id);
CREATE INDEX idx_withdrawals_status ON withdrawals(status);

-- ============================================================
-- MESSAGES
-- ============================================================

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id),
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (sender_id != receiver_id)
);

CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_booking ON messages(booking_id);
CREATE INDEX idx_messages_is_read ON messages(is_read);

-- ============================================================
-- SUPPORT TICKETS
-- ============================================================

CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status ticket_status NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tickets_user ON support_tickets(user_id);
CREATE INDEX idx_tickets_status ON support_tickets(status);

-- ============================================================
-- ADMIN LOGS
-- ============================================================

CREATE TABLE admin_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_admin_logs_admin ON admin_logs(admin_id);
CREATE INDEX idx_admin_logs_entity ON admin_logs(entity_type, entity_id);

-- ============================================================
-- AUDIT LOGS
-- ============================================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- ============================================================
-- CALENDAR SYNC
-- ============================================================

CREATE TABLE calendar_sync (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  provider calendar_provider NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  external_calendar_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(mentor_id, provider)
);

-- ============================================================
-- VIEWS
-- ============================================================

CREATE OR REPLACE VIEW mentor_profiles AS
SELECT
  m.id AS mentor_id,
  p.id AS profile_id,
  p.full_name,
  p.email,
  p.avatar_url,
  p.country,
  p.bio,
  p.linkedin_url,
  m.languages,
  m.headline,
  m.current_company,
  m.current_title,
  m.years_experience,
  m.hourly_rate,
  m.currency,
  m.is_verified,
  m.is_featured,
  m.is_accepting_bookings,
  m.cover_image_url,
  m.total_sessions,
  m.total_reviews,
  m.average_rating
FROM mentors m
JOIN profiles p ON m.profile_id = p.id
WHERE p.is_active = true;

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename IN (
      'profiles','mentors','specialties','mentor_specialties','certificates',
      'availability','bookings','payments','meetings','reviews','notifications',
      'favorites','earnings','withdrawals','messages','support_tickets',
      'admin_logs','audit_logs','calendar_sync'
    )
  LOOP
    EXECUTE format(
      'CREATE TRIGGER trg_%s_updated_at
       BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION update_updated_at()',
      t, t
    );
  END LOOP;
END;
$$;

-- Auto-create profile on auth signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update mentor rating after review
CREATE OR REPLACE FUNCTION update_mentor_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE mentors
  SET
    average_rating = (
      SELECT ROUND(AVG(rating)::NUMERIC, 2)
      FROM reviews
      WHERE mentor_id = COALESCE(NEW.mentor_id, OLD.mentor_id)
      AND is_public = true
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM reviews
      WHERE mentor_id = COALESCE(NEW.mentor_id, OLD.mentor_id)
      AND is_public = true
    )
  WHERE id = COALESCE(NEW.mentor_id, OLD.mentor_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_update_mentor_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_mentor_rating();

-- Increment total_sessions when booking completed
CREATE OR REPLACE FUNCTION update_mentor_sessions()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE mentors
    SET total_sessions = total_sessions + 1
    WHERE id = NEW.mentor_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_update_mentor_sessions
  AFTER UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_mentor_sessions();

-- Function to get available slots
CREATE OR REPLACE FUNCTION get_available_slots(
  p_mentor_id UUID,
  p_date DATE
)
RETURNS TABLE(slot_time TIMESTAMPTZ, is_available BOOLEAN) AS $$
DECLARE
  day_num INTEGER;
BEGIN
  day_num := EXTRACT(DOW FROM p_date);

  RETURN QUERY
  WITH slots AS (
    SELECT
      (p_date + a.start_time + (n || ' minutes')::INTERVAL)::TIMESTAMPTZ AS slot_time
    FROM availability a
    CROSS JOIN generate_series(0, (EXTRACT(EPOCH FROM (a.end_time - a.start_time)) / 3600 * 2 - 1)::INT) AS n
    WHERE a.mentor_id = p_mentor_id
    AND a.day_of_week = day_num
    AND a.is_active = true
  )
  SELECT
    s.slot_time,
    NOT EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.mentor_id = p_mentor_id
      AND b.status NOT IN ('cancelled', 'no_show')
      AND b.start_time <= s.slot_time
      AND b.end_time > s.slot_time
    ) AS is_available
  FROM slots s
  WHERE s.slot_time > NOW()
  ORDER BY s.slot_time;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- SEED: SPECIALTIES
-- ============================================================

INSERT INTO specialties (name, slug, category) VALUES
  ('Medical Affairs', 'medical-affairs', 'Clinical'),
  ('Medical Advisor', 'medical-advisor', 'Clinical'),
  ('MSL (Medical Science Liaison)', 'msl', 'Clinical'),
  ('Pharmaceutical Sales', 'pharma-sales', 'Commercial'),
  ('Marketing', 'marketing', 'Commercial'),
  ('Market Access', 'market-access', 'Commercial'),
  ('HEOR', 'heor', 'Commercial'),
  ('Commercial Excellence', 'commercial-excellence', 'Commercial'),
  ('Digital Health', 'digital-health', 'Technology'),
  ('Pharmacovigilance', 'pharmacovigilance', 'Regulatory'),
  ('Clinical Research', 'clinical-research', 'Clinical'),
  ('Regulatory Affairs', 'regulatory-affairs', 'Regulatory'),
  ('Quality Assurance', 'quality-assurance', 'Operations'),
  ('Supply Chain', 'supply-chain', 'Operations'),
  ('Biotechnology', 'biotechnology', 'Science'),
  ('Pharmacy', 'pharmacy', 'Clinical'),
  ('Medicine', 'medicine', 'Clinical'),
  ('Nursing', 'nursing', 'Clinical'),
  ('Healthcare Management', 'healthcare-management', 'Management'),
  ('Medical Writing', 'medical-writing', 'Content'),
  ('Career Coaching', 'career-coaching', 'Coaching'),
  ('Interview Preparation', 'interview-preparation', 'Coaching'),
  ('CV Review', 'cv-review', 'Coaching'),
  ('Leadership', 'leadership', 'Coaching'),
  ('Soft Skills', 'soft-skills', 'Coaching')
ON CONFLICT (slug) DO NOTHING;
