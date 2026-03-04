-- ============================================================
-- FEVADIS – Modificación de tabla Chats para soportar Grupos
-- ============================================================

ALTER TABLE public.chats
ADD COLUMN is_group BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN name TEXT,
ADD COLUMN admin_id UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL;

-- Actualizar cachés de PostgREST
NOTIFY pgrst, 'reload schema';
