-- ============================================================
-- FEVADIS – Group Chat Settings & Delete Fix
-- ============================================================

-- 1. Permiso para poder borrar chats (Faltaba en 002_rls.sql)
CREATE POLICY "chats_delete" ON public.chats
  FOR DELETE TO authenticated
  USING (
    -- Permite a admins y editores borrar cualquier chat
    public.get_my_role() IN ('admin', 'editor')
    -- Opcional: permitir al creador (admin_id) o si los vaciamos
  );

-- 2. Añadir opción de grupo silenciado a la tabla chats
ALTER TABLE public.chats
ADD COLUMN IF NOT EXISTS only_admins_can_speak BOOLEAN NOT NULL DEFAULT false;

-- Actualizar cachés
NOTIFY pgrst, 'reload schema';
