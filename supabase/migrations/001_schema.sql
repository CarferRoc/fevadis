-- ============================================================
-- FEVADIS Volunteer App – Database Schema
-- Run this ONCE in the Supabase SQL Editor
-- ============================================================

-- ─── Extensions ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─── Profiles ────────────────────────────────────────────────
-- Main user profile, linked to auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id     UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre      TEXT NOT NULL DEFAULT '',
  apellidos   TEXT NOT NULL DEFAULT '',
  email       TEXT UNIQUE,
  dni         TEXT UNIQUE,
  telefono    TEXT,
  role        TEXT NOT NULL DEFAULT 'voluntario'
                CHECK (role IN ('admin', 'editor', 'voluntario')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger: auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, nombre, apellidos, dni)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre', ''),
    COALESCE(NEW.raw_user_meta_data->>'apellidos', ''),
    COALESCE(NEW.raw_user_meta_data->>'dni', '')
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ─── Authorized DNIs ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.authorized_dnis (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dni         TEXT NOT NULL UNIQUE,
  status      TEXT NOT NULL DEFAULT 'activo'
                CHECK (status IN ('activo', 'usado', 'revocado')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by  UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  used_by     UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  used_at     TIMESTAMPTZ
);

-- ─── Activities ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.activities (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo       TEXT NOT NULL,
  descripcion  TEXT,
  categoria    TEXT NOT NULL DEFAULT 'Ocio'
                 CHECK (categoria IN ('Ocio', 'Campamentos', 'Formaciones', 'Talleres')),
  fecha_inicio TIMESTAMPTZ NOT NULL,
  fecha_fin    TIMESTAMPTZ NOT NULL,
  ubicacion    TEXT,
  plazas       INTEGER NOT NULL DEFAULT 0 CHECK (plazas >= 0),
  created_by   UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fecha_orden CHECK (fecha_fin > fecha_inicio)
);

-- ─── Registrations (Inscripciones) ───────────────────────────
CREATE TABLE IF NOT EXISTS public.registrations (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id             UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  user_id                 UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  status                  TEXT NOT NULL DEFAULT 'pendiente'
                            CHECK (status IN ('pendiente', 'aceptado', 'rechazado', 'lista_espera')),
  attendance              TEXT NOT NULL DEFAULT 'pendiente'
                            CHECK (attendance IN ('pendiente', 'asistio', 'no_asistio')),
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_by             UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  reviewed_at             TIMESTAMPTZ,
  attendance_marked_by    UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  attendance_marked_at    TIMESTAMPTZ,
  UNIQUE (activity_id, user_id)
);

-- ─── Chats ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.chats (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participants  UUID[] NOT NULL DEFAULT '{}',
  last_message  TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Messages ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id     UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  sender_id   UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  text        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster message retrieval
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON public.messages (chat_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_registrations_user ON public.registrations (user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_activity ON public.registrations (activity_id);
