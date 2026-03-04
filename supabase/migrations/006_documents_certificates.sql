-- ============================================================
-- FEVADIS – Documentos de usuario y certificados
-- ============================================================

-- Tabla documentos de usuario
CREATE TABLE IF NOT EXISTS public.user_documents (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  filename     TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_size    BIGINT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla certificados de asistencia
CREATE TABLE IF NOT EXISTS public.certificates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
  activity_id     UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  storage_path    TEXT NOT NULL,
  filename        TEXT NOT NULL,
  uploaded_by     UUID REFERENCES public.profiles(user_id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS user_documents
ALTER TABLE public.user_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "docs_own_select" ON public.user_documents
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.get_my_role() IN ('admin','editor'));

CREATE POLICY "docs_own_insert" ON public.user_documents
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "docs_own_delete" ON public.user_documents
  FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.get_my_role() IN ('admin','editor'));

-- RLS certificates
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "certs_read" ON public.certificates
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.get_my_role() IN ('admin','editor'));

CREATE POLICY "certs_write" ON public.certificates
  FOR INSERT TO authenticated
  WITH CHECK (public.get_my_role() IN ('admin','editor'));

-- Función de limpieza de inscripciones antiguas (asistio, >7 días)
CREATE OR REPLACE FUNCTION public.cleanup_old_registrations()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  DELETE FROM public.registrations
  WHERE attendance = 'asistio'
    AND attendance_marked_at < NOW() - INTERVAL '7 days';
END;
$$;

-- Recargar cache de PostgREST
NOTIFY pgrst, 'reload schema';
