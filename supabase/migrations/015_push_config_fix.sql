-- ============================================================
-- FEVADIS – Fix para 014
-- Run AFTER 014_push_notifications.sql
--
-- Supabase managed no permite `ALTER DATABASE postgres SET ...`
-- (error 42501 permission denied), así que cambiamos el mecanismo:
-- los settings viven en una tabla privada `app_settings` y la
-- función fan_out_push los lee de allí.
--
-- Esta migración es IDEMPOTENTE — se puede re-ejecutar sin romper.
-- ============================================================


-- ─── 1. Tabla privada de settings ─────────────────────────────
-- Solo postgres y service_role pueden leer. RLS habilitada sin
-- policies + REVOKE = nadie accede vía PostgREST con anon/auth.
CREATE TABLE IF NOT EXISTS public.app_settings (
    key        TEXT PRIMARY KEY,
    value      TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.app_settings FROM PUBLIC;
REVOKE ALL ON public.app_settings FROM anon, authenticated;


-- ─── 2. Reescritura de fan_out_push ──────────────────────────
-- Lee la URL y el secret desde app_settings en lugar de
-- current_setting('app.settings.*'). La función corre como
-- SECURITY DEFINER con search_path fijado, así que bypassa la RLS
-- de app_settings aunque el caller sea un voluntario.
CREATE OR REPLACE FUNCTION public.fan_out_push(p_payload JSONB)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    PERFORM net.http_post(
        url := (SELECT value FROM public.app_settings WHERE key = 'edge_base_url')
            || '/send-push',
        headers := jsonb_build_object(
            'Content-Type',    'application/json',
            'x-service-secret', (SELECT value FROM public.app_settings
                                 WHERE key = 'edge_service_secret')
        ),
        body := p_payload
    );
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'fan_out_push: %', SQLERRM;
END;
$$;
