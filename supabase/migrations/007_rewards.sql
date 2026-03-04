-- ============================================================
-- FEVADIS – Recompensas
-- ============================================================

CREATE TABLE IF NOT EXISTS public.rewards (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo       TEXT NOT NULL,
  descripcion  TEXT,
  costo_puntos INTEGER NOT NULL DEFAULT 0,
  stock        INTEGER DEFAULT NULL, -- NULL significa infinito, número entero significa cantidad disponible
  image_url    TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by   UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL
);

-- RLS rewards
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;

-- Todos los usuarios autenticados pueden ver las recompensas
CREATE POLICY "rewards_read" ON public.rewards
  FOR SELECT TO authenticated
  USING (true);

-- Solo admins o editores pueden crear, actualizar o borrar recompensas
CREATE POLICY "rewards_write" ON public.rewards
  FOR INSERT TO authenticated
  WITH CHECK (public.get_my_role() IN ('admin','editor'));

CREATE POLICY "rewards_update" ON public.rewards
  FOR UPDATE TO authenticated
  USING (public.get_my_role() IN ('admin','editor'))
  WITH CHECK (public.get_my_role() IN ('admin','editor'));

CREATE POLICY "rewards_delete" ON public.rewards
  FOR DELETE TO authenticated
  USING (public.get_my_role() IN ('admin','editor'));

-- Recargar cache de PostgREST
NOTIFY pgrst, 'reload schema';
