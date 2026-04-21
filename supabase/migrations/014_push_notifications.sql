-- ============================================================
-- FEVADIS – Push notifications (FCM)
-- Run AFTER 013_auth_rpcs.sql
--
-- 1. Tabla push_tokens (un registro por token/dispositivo)
-- 2. Extensión pg_net para llamadas HTTP asíncronas desde triggers
-- 3. Función fan_out_push: dispara la Edge Function send-push
-- 4. Triggers en messages, activities y documents
--
-- ANTES DE EJECUTAR:
-- Necesitas configurar dos settings en la base de datos para que los
-- triggers puedan llamar a la Edge Function. En el SQL editor ejecuta:
--
--     ALTER DATABASE postgres SET app.settings.edge_base_url =
--         'https://ecoqeazghmursjexcwxt.supabase.co/functions/v1';
--     ALTER DATABASE postgres SET app.settings.edge_service_secret =
--         '<pon-aqui-un-secret-largo-aleatorio>';
--
-- El MISMO valor de edge_service_secret hay que ponerlo como secret en
-- la Edge Function (ver supabase/functions/send-push/README).
-- ============================================================


-- ─── 1. Extensión pg_net (http desde SQL) ────────────────────
CREATE EXTENSION IF NOT EXISTS pg_net;


-- ─── 2. Tabla push_tokens ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.push_tokens (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    token        TEXT NOT NULL UNIQUE,
    platform     TEXT NOT NULL CHECK (platform IN ('web', 'ios', 'android')),
    user_agent   TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_push_tokens_user_id ON public.push_tokens(user_id);

ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

-- Un usuario solo puede ver / crear / borrar sus propios tokens.
DROP POLICY IF EXISTS push_tokens_select_own ON public.push_tokens;
CREATE POLICY push_tokens_select_own
    ON public.push_tokens FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS push_tokens_insert_own ON public.push_tokens;
CREATE POLICY push_tokens_insert_own
    ON public.push_tokens FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS push_tokens_update_own ON public.push_tokens;
CREATE POLICY push_tokens_update_own
    ON public.push_tokens FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS push_tokens_delete_own ON public.push_tokens;
CREATE POLICY push_tokens_delete_own
    ON public.push_tokens FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());


-- ─── 3. fan_out_push — llama a la Edge Function vía pg_net ───
-- Se invoca desde los triggers con un payload JSON.
CREATE OR REPLACE FUNCTION public.fan_out_push(p_payload JSONB)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_url    TEXT := current_setting('app.settings.edge_base_url', true);
    v_secret TEXT := current_setting('app.settings.edge_service_secret', true);
BEGIN
    IF v_url IS NULL OR v_secret IS NULL THEN
        RAISE WARNING 'fan_out_push: edge_base_url o edge_service_secret no configurados';
        RETURN;
    END IF;

    PERFORM net.http_post(
        url     := v_url || '/send-push',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'x-service-secret', v_secret
        ),
        body    := p_payload
    );
END;
$$;


-- ─── 4. Trigger: nuevo mensaje en chat ───────────────────────
CREATE OR REPLACE FUNCTION public.on_message_insert_push()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_chat           public.chats%ROWTYPE;
    v_sender_profile public.profiles%ROWTYPE;
BEGIN
    SELECT * INTO v_chat FROM public.chats WHERE id = NEW.chat_id;
    IF NOT FOUND THEN RETURN NEW; END IF;

    SELECT * INTO v_sender_profile FROM public.profiles WHERE user_id = NEW.sender_id;

    PERFORM public.fan_out_push(jsonb_build_object(
        'type', 'message',
        'chat_id', NEW.chat_id,
        'chat_name', COALESCE(v_chat.name, 'Mensaje nuevo'),
        'is_group', COALESCE(v_chat.is_group, false),
        'participants', to_jsonb(v_chat.participants),
        'sender_id', NEW.sender_id,
        'sender_name', COALESCE(v_sender_profile.nombre, '') || ' ' || COALESCE(v_sender_profile.apellidos, ''),
        'text', NEW.text
    ));
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_message_push ON public.messages;
CREATE TRIGGER trg_message_push
    AFTER INSERT ON public.messages
    FOR EACH ROW EXECUTE FUNCTION public.on_message_insert_push();


-- ─── 5. Trigger: nueva actividad ─────────────────────────────
CREATE OR REPLACE FUNCTION public.on_activity_insert_push()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    PERFORM public.fan_out_push(jsonb_build_object(
        'type', 'activity',
        'activity_id', NEW.id,
        'titulo', NEW.titulo,
        'categoria', NEW.categoria,
        'fecha_inicio', NEW.fecha_inicio,
        'created_by', NEW.created_by
    ));
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_activity_push ON public.activities;
CREATE TRIGGER trg_activity_push
    AFTER INSERT ON public.activities
    FOR EACH ROW EXECUTE FUNCTION public.on_activity_insert_push();


-- ─── 6. Trigger: nuevo documento de información ──────────────
CREATE OR REPLACE FUNCTION public.on_document_insert_push()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    PERFORM public.fan_out_push(jsonb_build_object(
        'type', 'info_doc',
        'document_id', NEW.id,
        'title', NEW.title,
        'category', NEW.category,
        'uploaded_by', NEW.uploaded_by
    ));
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_document_push ON public.documents;
CREATE TRIGGER trg_document_push
    AFTER INSERT ON public.documents
    FOR EACH ROW EXECUTE FUNCTION public.on_document_insert_push();
