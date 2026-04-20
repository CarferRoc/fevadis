-- ============================================================
-- FEVADIS – Documentos informativos del voluntariado
-- Tabla que alimenta la pantalla "Información del Voluntariado"
-- Solo los admins suben; todos los autenticados leen.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.documents (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  category     TEXT NOT NULL DEFAULT 'General',
  url          TEXT NOT NULL,
  file_type    TEXT,
  file_size    BIGINT,
  uploaded_by  UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_created_at
  ON public.documents (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_documents_category
  ON public.documents (category);

-- ─── RLS tabla ──────────────────────────────────────────────
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "info_docs_read_all_auth" ON public.documents;
CREATE POLICY "info_docs_read_all_auth" ON public.documents
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "info_docs_insert_admin" ON public.documents;
CREATE POLICY "info_docs_insert_admin" ON public.documents
  FOR INSERT TO authenticated
  WITH CHECK (public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "info_docs_update_admin" ON public.documents;
CREATE POLICY "info_docs_update_admin" ON public.documents
  FOR UPDATE TO authenticated
  USING (public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "info_docs_delete_admin" ON public.documents;
CREATE POLICY "info_docs_delete_admin" ON public.documents
  FOR DELETE TO authenticated
  USING (public.get_my_role() = 'admin');

-- ─── Bucket de Storage ──────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- ─── Políticas de Storage sobre el bucket 'documents' ───────
-- Lectura: cualquier usuario autenticado puede descargar
DROP POLICY IF EXISTS "info_docs_storage_read" ON storage.objects;
CREATE POLICY "info_docs_storage_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'documents');

-- Subida: solo admins
DROP POLICY IF EXISTS "info_docs_storage_insert" ON storage.objects;
CREATE POLICY "info_docs_storage_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'documents'
    AND public.get_my_role() = 'admin'
  );

-- Borrado: solo admins
DROP POLICY IF EXISTS "info_docs_storage_delete" ON storage.objects;
CREATE POLICY "info_docs_storage_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'documents'
    AND public.get_my_role() = 'admin'
  );

-- Recargar cache de PostgREST
NOTIFY pgrst, 'reload schema';
