-- MentorRx Migration 004
-- Adds: meeting_providers table (admin-managed video provider configuration)

CREATE TABLE IF NOT EXISTS meeting_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider video_provider NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  is_default BOOLEAN NOT NULL DEFAULT false,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Only one provider can be the default
CREATE UNIQUE INDEX IF NOT EXISTS idx_meeting_providers_single_default
  ON meeting_providers(is_default)
  WHERE is_default = true;

CREATE INDEX IF NOT EXISTS idx_meeting_providers_enabled ON meeting_providers(is_enabled);

CREATE TRIGGER trg_meeting_providers_updated_at
  BEFORE UPDATE ON meeting_providers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE meeting_providers ENABLE ROW LEVEL SECURITY;

-- Any authenticated flow (e.g. booking creation) needs to know which providers are enabled
CREATE POLICY "meeting_providers_public_select" ON meeting_providers
  FOR SELECT USING (is_enabled = true);

CREATE POLICY "meeting_providers_admin_all" ON meeting_providers
  FOR ALL USING (is_admin());

-- Seed the three supported providers
INSERT INTO meeting_providers (provider, display_name, is_enabled, is_default) VALUES
  ('zoom', 'Zoom', true, true),
  ('teams', 'Microsoft Teams', true, false),
  ('google_meet', 'Google Meet', true, false)
ON CONFLICT (provider) DO NOTHING;
