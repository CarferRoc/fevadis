-- ============================================================
-- FEVADIS – Fix definitivo trigger handle_new_user
-- Ejecutar en Supabase Dashboard → SQL Editor
-- ============================================================
-- El trigger anterior podía fallar y causar "database error saving
-- new user" porque:
-- 1. dni = '' (string vacío) viola el UNIQUE constraint
-- 2. Cualquier excepción en el trigger bloquea el registro completo
--
-- Esta versión captura TODOS los errores sin relanzarlos, y convierte
-- strings vacíos a NULL para evitar conflictos de unicidad.
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  BEGIN
    INSERT INTO public.profiles (user_id, email, nombre, apellidos, dni)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'nombre'), ''), ''),
      COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'apellidos'), ''), ''),
      NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'dni', '')), '')
    )
    ON CONFLICT (user_id) DO UPDATE SET
      email     = EXCLUDED.email,
      nombre    = CASE WHEN EXCLUDED.nombre <> '' THEN EXCLUDED.nombre ELSE profiles.nombre END,
      apellidos = CASE WHEN EXCLUDED.apellidos <> '' THEN EXCLUDED.apellidos ELSE profiles.apellidos END,
      dni       = COALESCE(EXCLUDED.dni, profiles.dni);
  EXCEPTION WHEN OTHERS THEN
    -- No relanzar el error para que el registro no falle.
    -- El authService actualizará el perfil a continuación.
    RAISE WARNING 'handle_new_user: %', SQLERRM;
  END;
  RETURN NEW;
END;
$$;
