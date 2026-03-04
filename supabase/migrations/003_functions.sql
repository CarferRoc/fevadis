-- ============================================================
-- FEVADIS – Helper Functions (SECURITY DEFINER)
-- Run AFTER 002_rls.sql
-- ============================================================

-- ─── check_authorized_dni ────────────────────────────────────
-- Called by the app before showing the registration form.
-- Returns TRUE if the DNI exists and its status is 'activo'.
-- SECURITY DEFINER bypasses RLS so it works without auth.
CREATE OR REPLACE FUNCTION public.check_authorized_dni(p_dni TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  v_status TEXT;
BEGIN
  SELECT status INTO v_status
  FROM public.authorized_dnis
  WHERE UPPER(TRIM(dni)) = UPPER(TRIM(p_dni));

  RETURN v_status = 'activo';
END;
$$;

-- ─── use_authorized_dni ──────────────────────────────────────
-- Called right after a user signs up successfully.
-- Marks the DNI as 'usado' and records which user used it.
CREATE OR REPLACE FUNCTION public.use_authorized_dni(p_dni TEXT, p_user_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  UPDATE public.authorized_dnis
  SET
    status   = 'usado',
    used_by  = p_user_id,
    used_at  = NOW()
  WHERE
    UPPER(TRIM(dni)) = UPPER(TRIM(p_dni))
    AND status = 'activo';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'DNI % no está disponible para usar', p_dni;
  END IF;
END;
$$;

-- ─── safe_change_role ────────────────────────────────────────
-- Changes a user's role, but prevents removing the last admin.
CREATE OR REPLACE FUNCTION public.safe_change_role(p_target_user_id UUID, p_new_role TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  v_current_role TEXT;
  v_admin_count  INTEGER;
  v_caller_role  TEXT;
BEGIN
  -- Only admin or editor may call this
  SELECT role INTO v_caller_role FROM public.profiles WHERE user_id = auth.uid();
  IF v_caller_role NOT IN ('admin', 'editor') THEN
    RAISE EXCEPTION 'No tienes permiso para cambiar roles';
  END IF;

  -- Validate new role
  IF p_new_role NOT IN ('admin', 'editor', 'voluntario') THEN
    RAISE EXCEPTION 'Rol inválido: %', p_new_role;
  END IF;

  -- Get current role of target user
  SELECT role INTO v_current_role FROM public.profiles WHERE user_id = p_target_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Usuario no encontrado';
  END IF;

  -- If downgrading an admin, ensure at least one admin remains
  IF v_current_role = 'admin' AND p_new_role != 'admin' THEN
    SELECT COUNT(*) INTO v_admin_count
    FROM public.profiles WHERE role = 'admin';

    IF v_admin_count <= 1 THEN
      RAISE EXCEPTION 'No puedes quitar el rol de admin al último administrador del sistema';
    END IF;
  END IF;

  -- Perform the update
  UPDATE public.profiles
  SET role = p_new_role
  WHERE user_id = p_target_user_id;
END;
$$;

-- ─── Grant execute on functions ──────────────────────────────
GRANT EXECUTE ON FUNCTION public.check_authorized_dni(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.check_authorized_dni(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.use_authorized_dni(TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.safe_change_role(UUID, TEXT) TO authenticated;
