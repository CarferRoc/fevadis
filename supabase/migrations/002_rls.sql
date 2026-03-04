-- ============================================================
-- FEVADIS – Row Level Security Policies
-- Run AFTER 001_schema.sql
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.authorized_dnis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$;

-- ─── PROFILES ────────────────────────────────────────────────
-- Any authenticated user can read profiles
CREATE POLICY "profiles_read" ON public.profiles
  FOR SELECT TO authenticated USING (true);

-- Users can update their own profile; admin/editor can update any
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.get_my_role() IN ('admin', 'editor'));

-- ─── AUTHORIZED_DNIS ─────────────────────────────────────────
-- Only admin/editor can manage DNIs
CREATE POLICY "dnis_admin_only" ON public.authorized_dnis
  FOR ALL TO authenticated
  USING (public.get_my_role() IN ('admin', 'editor'))
  WITH CHECK (public.get_my_role() IN ('admin', 'editor'));

-- ─── ACTIVITIES ───────────────────────────────────────────────
-- Everyone authenticated can read
CREATE POLICY "activities_read" ON public.activities
  FOR SELECT TO authenticated USING (true);

-- Only admin/editor can write
CREATE POLICY "activities_write" ON public.activities
  FOR INSERT TO authenticated
  WITH CHECK (public.get_my_role() IN ('admin', 'editor'));

CREATE POLICY "activities_update" ON public.activities
  FOR UPDATE TO authenticated
  USING (public.get_my_role() IN ('admin', 'editor'));

CREATE POLICY "activities_delete" ON public.activities
  FOR DELETE TO authenticated
  USING (public.get_my_role() IN ('admin', 'editor'));

-- ─── REGISTRATIONS ───────────────────────────────────────────
-- Users can read their own; admin/editor can read all
CREATE POLICY "registrations_read" ON public.registrations
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.get_my_role() IN ('admin', 'editor'));

-- Volunteers can insert their own registration
CREATE POLICY "registrations_insert" ON public.registrations
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Admin/editor can update any; user cannot update own
CREATE POLICY "registrations_update" ON public.registrations
  FOR UPDATE TO authenticated
  USING (public.get_my_role() IN ('admin', 'editor'));

-- ─── CHATS ────────────────────────────────────────────────────
-- Users can only see chats they're part of
CREATE POLICY "chats_read" ON public.chats
  FOR SELECT TO authenticated
  USING (auth.uid() = ANY(participants));

CREATE POLICY "chats_insert" ON public.chats
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = ANY(participants));

CREATE POLICY "chats_update" ON public.chats
  FOR UPDATE TO authenticated
  USING (auth.uid() = ANY(participants));

-- ─── MESSAGES ─────────────────────────────────────────────────
-- Users can see messages from chats they're in
CREATE POLICY "messages_read" ON public.messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.chats
      WHERE id = chat_id AND auth.uid() = ANY(participants)
    )
  );

CREATE POLICY "messages_insert" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.chats
      WHERE id = chat_id AND auth.uid() = ANY(participants)
    )
  );
