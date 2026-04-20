-- ═══════════════════════════════════════════════════════════════════
-- TGN Surf School — Migración: Formularios, Automatizaciones y Clientes
-- Ejecutar en Supabase SQL Editor o psql
-- ═══════════════════════════════════════════════════════════════════

-- ──────────────────────────────────────────────────────────────────
-- 1. Nuevas columnas en tabla USERS
-- ──────────────────────────────────────────────────────────────────
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS marketing_consent   BOOLEAN   NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS preferred_beach     TEXT,
  ADD COLUMN IF NOT EXISTS interests           TEXT[],    -- ['surf','paddle','events','erasmus','packs']
  ADD COLUMN IF NOT EXISTS last_session_date   DATE;

-- ──────────────────────────────────────────────────────────────────
-- 2. Nuevas columnas en tabla CLASSES
-- ──────────────────────────────────────────────────────────────────
ALTER TABLE classes
  ADD COLUMN IF NOT EXISTS maps_url            TEXT,      -- Google Maps del spot
  ADD COLUMN IF NOT EXISTS google_review_url   TEXT;      -- enlace reseña Google negocio

-- ──────────────────────────────────────────────────────────────────
-- 3. Tabla SESSION_INTAKE — formulario pre-sesión
-- ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS session_intake (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booking_id      UUID        REFERENCES bookings(id) ON DELETE SET NULL,
  -- pregunta 1: experiencia previa
  surf_frequency  TEXT        NOT NULL,   -- 'never'|'1_3'|'4_10'|'10_plus'|'regular'
  -- pregunta 2: nivel declarado (null si frequency = 'never')
  declared_level  TEXT,                   -- 'initiation'|'adv_initiation'|'intermediate'|'advanced'
  -- pregunta 3: material propio
  own_gear        TEXT        NOT NULL,   -- 'board_wetsuit'|'board_only'|'wetsuit_only'|'none'
  -- pregunta 4: talla neopreno
  wetsuit_size    TEXT,                   -- 'XS'|'S'|'M'|'L'|'XL'|'unknown'
  -- pregunta 5: medida tabla
  board_size      TEXT,                   -- '5_10'|'6_6'|'6_8'|'7_0'|'7_2'|'7_6'|'8_0'|'8_2'|'other'
  board_notes     TEXT,                   -- campo libre 5.1
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────────
-- 4. Tabla SESSION_FEEDBACK — formulario post-sesión
-- ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS session_feedback (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booking_id          UUID        REFERENCES bookings(id) ON DELETE SET NULL,
  -- pregunta 1: sensación general
  session_feeling     TEXT        NOT NULL,  -- 'very_comfortable'|'comfortable'|'hard'|'need_practice'
  -- pregunta 2: contenidos trabajados (hasta 3 bloques + ítems)
  worked_blocks       JSONB       NOT NULL DEFAULT '[]',
  -- Estructura: [{ block: 'base_tecnica', items: ['remada_consciente', 'puesta_de_pie'] }, ...]
  -- pregunta 3: sensación de logro
  achievement_feeling TEXT,                  -- 'yes'|'partially'|'not_yet'|'need_more'
  -- pregunta 4: objetivo de mejora
  improvement_goal    TEXT,
  -- pregunta 5: valoración estrellas
  rating              INTEGER     CHECK (rating BETWEEN 1 AND 5),
  -- si valoración >= 4 y hizo click en el botón
  google_review_sent  BOOLEAN     NOT NULL DEFAULT false,
  -- control
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────────
-- 5. Nuevas columnas en tabla BOOKINGS (FK a formularios)
-- ──────────────────────────────────────────────────────────────────
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS intake_id    UUID REFERENCES session_intake(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS feedback_id  UUID REFERENCES session_feedback(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN NOT NULL DEFAULT false;

-- ──────────────────────────────────────────────────────────────────
-- 6. Índices para performance
-- ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_session_intake_user    ON session_intake(user_id);
CREATE INDEX IF NOT EXISTS idx_session_intake_booking ON session_intake(booking_id);
CREATE INDEX IF NOT EXISTS idx_session_feedback_user    ON session_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_session_feedback_booking ON session_feedback(booking_id);
CREATE INDEX IF NOT EXISTS idx_bookings_reminder_sent   ON bookings(reminder_sent) WHERE reminder_sent = false;

-- ──────────────────────────────────────────────────────────────────
-- 7. Google review URL por defecto (ejemplo — actualizar con URL real)
-- ──────────────────────────────────────────────────────────────────
-- UPDATE classes SET google_review_url = 'https://g.page/r/YOUR_PLACE_ID/review';
-- O bien a nivel global, actualizar en la aplicación desde el panel de admin.

-- ══════════════════════════════════════════════════════
-- FIN DE MIGRACIÓN
-- ══════════════════════════════════════════════════════
