-- ============================================================
-- FEVADIS – RPCs para soporte sin service_role
-- Run AFTER 012_security_hardening.sql
--
-- Añade las RPCs necesarias para que los clientes (web + móvil)
-- puedan funcionar usando SOLO la anon/publishable key:
--   - get_email_by_dni:  login por DNI (ejecutable por anon)
--   - get_chat_participants: nombres de miembros del grupo
-- ============================================================


-- ─── get_email_by_dni ─────────────────────────────────────────
-- Devuelve el email de un perfil a partir del DNI. Ejecutable por
-- `anon` para permitir el flujo de login "DNI + contraseña" antes
-- de que el usuario tenga sesión.
--
-- Notas de seguridad:
--  · Expone únicamente UN campo (email) y solo si el DNI existe.
--  · Normaliza el input (trim + upper).
CREATE OR REPLACE FUNCTION public.get_email_by_dni(p_dni TEXT)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT email
    FROM public.profiles
    WHERE UPPER(TRIM(dni)) = UPPER(TRIM(p_dni))
    LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_email_by_dni(TEXT) TO anon, authenticated;


-- ─── get_chat_participants ────────────────────────────────────
-- Devuelve los participantes de un chat. Solo funciona si el
-- caller es parte del chat. Expone únicamente user_id, nombre,
-- apellidos y rol — nunca dni/email/teléfono.
CREATE OR REPLACE FUNCTION public.get_chat_participants(p_chat_id UUID)
RETURNS TABLE (
    user_id UUID,
    nombre TEXT,
    apellidos TEXT,
    role TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT p.user_id, p.nombre, p.apellidos, p.role::TEXT
    FROM public.profiles p
    JOIN public.chats c ON p.user_id = ANY(c.participants)
    WHERE c.id = p_chat_id
      AND auth.uid() = ANY(c.participants);
$$;

GRANT EXECUTE ON FUNCTION public.get_chat_participants(UUID) TO authenticated;
