-- ============================================================
-- FEVADIS – Seed Data
-- Run in Supabase SQL Editor AFTER 001_schema.sql, 002_rls.sql, 003_functions.sql
--
-- IMPORTANT: Replace 'DNI_DEL_PRIMER_ADMIN' with your Admin's real DNI
-- e.g., '12345678Z'
-- ============================================================

-- Authorize the first admin's DNI so they can register
-- (replace with the actual DNI before running)
INSERT INTO public.authorized_dnis (dni, status, created_by)
VALUES
  ('12345678Z', 'activo', NULL),   -- future admin
  ('87654321X', 'activo', NULL),   -- future editor
  ('11223344M', 'activo', NULL)    -- future voluntario
ON CONFLICT (dni) DO NOTHING;

-- Example activities (run after you have at least one user)
-- These can be added via the admin panel, but here for reference:
/*
INSERT INTO public.activities (titulo, descripcion, categoria, fecha_inicio, fecha_fin, ubicacion, plazas, created_by)
VALUES
  (
    'Taller de Manualidades',
    'Actividad de manualidades para personas con discapacidad intelectual.',
    'Talleres',
    NOW() + INTERVAL '7 days',
    NOW() + INTERVAL '7 days 3 hours',
    'Centro FEVADIS – Av. Constitución 10, Valencia',
    20,
    '<ADMIN_USER_ID>'
  ),
  (
    'Campamento de Verano',
    'Campamento de una semana en la sierra con actividades al aire libre.',
    'Campamentos',
    NOW() + INTERVAL '30 days',
    NOW() + INTERVAL '37 days',
    'Camping El Pinar, Segorbe',
    15,
    '<ADMIN_USER_ID>'
  );
*/
