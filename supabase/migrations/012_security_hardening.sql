-- ============================================================
-- FEVADIS – Security hardening
-- Run AFTER 011_info_documents.sql
--
-- Propósito: dejar el esquema seguro para poder usar solo la
-- clave PUBLISHABLE/ANON en los clientes (web + móvil). Hasta
-- ahora los clientes usaban la service_role key, que bypassa RLS
-- y por tanto ocultaba todos los agujeros. Este archivo:
--   1. Restringe profiles_read (voluntarios no leen datos ajenos)
--   2. Crea una vista pública de perfiles (nombre, apellidos, rol)
--   3. Tighten registrations_update
--   4. Añade DELETE policy en messages (autor)
--   5. Storage policies para user-documents y certificates
-- ============================================================

-- ─── 1. PROFILES: restringir lectura ─────────────────────────
-- Voluntarios solo ven su propio perfil; admin/editor ven todo.
DROP POLICY IF EXISTS profiles_read ON public.profiles;

CREATE POLICY profiles_read_scoped
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid()
        OR public.get_my_role() IN ('admin', 'editor')
    );

-- Los voluntarios también pueden necesitar INSERT de su propio
-- perfil en el flujo de registro (el trigger handle_new_user lo
-- hace, pero el upsert del cliente viene después). Aseguramos:
DROP POLICY IF EXISTS profiles_insert_self ON public.profiles;
CREATE POLICY profiles_insert_self
    ON public.profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());


-- ─── 2. VISTA PÚBLICA DE PERFILES ────────────────────────────
-- Para poder mostrar nombres en chats de grupo sin exponer
-- dni/email/teléfono. La vista se ejecuta con permisos del owner
-- (postgres) y solo expone campos no-sensibles.
CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker = false)
AS
SELECT
    user_id,
    nombre,
    apellidos,
    role
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO authenticated;


-- ─── 3. REGISTRATIONS: update solo admin/editor + delete ─────
-- La policy existente registrations_update ya exige admin/editor.
-- Añadimos DELETE (solo admin) por completitud.
DROP POLICY IF EXISTS registrations_delete ON public.registrations;
CREATE POLICY registrations_delete
    ON public.registrations
    FOR DELETE
    TO authenticated
    USING (public.get_my_role() IN ('admin', 'editor'));


-- ─── 4. MESSAGES: delete solo el autor o admin ───────────────
DROP POLICY IF EXISTS messages_delete_own ON public.messages;
CREATE POLICY messages_delete_own
    ON public.messages
    FOR DELETE
    TO authenticated
    USING (
        sender_id = auth.uid()
        OR public.get_my_role() = 'admin'
    );


-- ─── 5. CHATS: delete solo admin ─────────────────────────────
-- Por si 010 no lo dejó claro.
DROP POLICY IF EXISTS chats_delete_admin ON public.chats;
CREATE POLICY chats_delete_admin
    ON public.chats
    FOR DELETE
    TO authenticated
    USING (public.get_my_role() IN ('admin', 'editor'));


-- ─── 6. STORAGE BUCKETS ──────────────────────────────────────
-- Crea los buckets (idempotente) y sus policies.

-- 6.a — Asegurar que los buckets existen (privados).
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('user-documents', 'user-documents', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('certificates', 'certificates', false)
ON CONFLICT (id) DO NOTHING;


-- 6.b — user-documents: el dueño sube/lee/borra lo suyo; admin/editor lee todo.
-- Convención de path usada por el cliente: `${userId}/${timestamp}_${filename}`
DROP POLICY IF EXISTS "user-docs insert own" ON storage.objects;
CREATE POLICY "user-docs insert own"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'user-documents'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

DROP POLICY IF EXISTS "user-docs read own or staff" ON storage.objects;
CREATE POLICY "user-docs read own or staff"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'user-documents'
        AND (
            (storage.foldername(name))[1] = auth.uid()::text
            OR public.get_my_role() IN ('admin', 'editor')
        )
    );

DROP POLICY IF EXISTS "user-docs delete own" ON storage.objects;
CREATE POLICY "user-docs delete own"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'user-documents'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );


-- 6.c — certificates: solo admin/editor sube/borra; los interesados
-- leen los suyos (match contra la tabla certificates), staff lee todo.
DROP POLICY IF EXISTS "certs insert staff" ON storage.objects;
CREATE POLICY "certs insert staff"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'certificates'
        AND public.get_my_role() IN ('admin', 'editor')
    );

DROP POLICY IF EXISTS "certs read own or staff" ON storage.objects;
CREATE POLICY "certs read own or staff"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'certificates'
        AND (
            public.get_my_role() IN ('admin', 'editor')
            OR EXISTS (
                SELECT 1 FROM public.certificates c
                WHERE c.storage_path = storage.objects.name
                AND c.user_id = auth.uid()
            )
        )
    );

DROP POLICY IF EXISTS "certs delete staff" ON storage.objects;
CREATE POLICY "certs delete staff"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'certificates'
        AND public.get_my_role() IN ('admin', 'editor')
    );


-- 6.d — documents (info pública para voluntarios): todos los
-- autenticados leen, solo admin/editor escribe.
DROP POLICY IF EXISTS "info-docs read authenticated" ON storage.objects;
CREATE POLICY "info-docs read authenticated"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (bucket_id = 'documents');

DROP POLICY IF EXISTS "info-docs write staff" ON storage.objects;
CREATE POLICY "info-docs write staff"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'documents'
        AND public.get_my_role() IN ('admin', 'editor')
    );

DROP POLICY IF EXISTS "info-docs delete staff" ON storage.objects;
CREATE POLICY "info-docs delete staff"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'documents'
        AND public.get_my_role() IN ('admin', 'editor')
    );
