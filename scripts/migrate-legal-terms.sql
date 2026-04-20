-- ═══════════════════════════════════════════════════════════════════
-- TGN Surf School — Migración: Términos Legales y Trazabilidad
-- ═══════════════════════════════════════════════════════════════════

-- 1. Actualizar tabla USERS para soportar detección de menores y DNI
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS birthdate DATE,
  ADD COLUMN IF NOT EXISTS dni       TEXT;

-- 2. Actualizar tabla BOOKINGS con campos de trazabilidad legal y tutores
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS legal_accepted_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS legal_accepted_ip  TEXT,
  ADD COLUMN IF NOT EXISTS legal_version      TEXT,
  ADD COLUMN IF NOT EXISTS is_minor           BOOLEAN DEFAULT false,
  -- Campos de tutor (solo se llenan si is_minor es true)
  ADD COLUMN IF NOT EXISTS tutor_name         TEXT,
  ADD COLUMN IF NOT EXISTS tutor_id           TEXT, -- DNI/Pasaporte del tutor
  ADD COLUMN IF NOT EXISTS tutor_phone        TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact    TEXT;

-- 3. Comentario informativo
COMMENT ON COLUMN bookings.legal_version IS 'Versión del texto legal aceptado (ej: 2026-04-v1)';
