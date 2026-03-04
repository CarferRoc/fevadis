-- ============================================================
-- FEVADIS – Activar Realtime para Chats y Mensajes
-- ============================================================

-- Activar Realtime en las tablas de mensajes y chats para que
-- los websockets (suscripciones) envíen los eventos al cliente.
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chats;

-- Actualizar cachés de PostgREST
NOTIFY pgrst, 'reload schema';
