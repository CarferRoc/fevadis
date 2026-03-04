-- ============================================================
-- FEVADIS – Fix políticas RLS para registro de usuarios
-- Ejecutar en Supabase Dashboard → SQL Editor
-- ============================================================
-- Problema: un usuario recién registrado no puede hacer INSERT
-- en profiles porque no existe una política RLS que lo permita.
-- El trigger (SECURITY DEFINER) puede insertar, pero el upsert
-- desde el cliente necesita permiso de INSERT también.
-- ============================================================

-- Permitir que un usuario inserte su propio perfil
-- (necesario para el upsert desde authService)
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Recargar schema cache de PostgREST
NOTIFY pgrst, 'reload schema';
