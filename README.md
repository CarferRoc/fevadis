# FEVADIS Volunteer App

App móvil de voluntariado para FEVADIS. Expo + React Native + TypeScript + Supabase.

---

## Stack tecnológico

| Tecnología | Uso |
|---|---|
| Expo SDK 54 | Plataforma móvil (iOS + Android) |
| React Native + TypeScript | UI |
| Supabase (Auth + Postgres) | Backend, auth, BBDD |
| Zustand | Estado global |
| React Query | Caché y fetching de datos |
| React Navigation | Navegación (tabs + stacks) |

---

## Prerrequisitos

- Node.js 18+
- npm o yarn
- Expo Go en tu dispositivo (o un emulador Android/iOS)
- Proyecto Supabase (gratuito en [supabase.com](https://supabase.com))

---

## 1. Configurar Supabase

### 1.1 Crear el proyecto

1. Ve a [supabase.com](https://supabase.com) → New Project
2. Anota la **URL del proyecto** y la **anon key** (Settings → API)

### 1.2 Ejecutar las migraciones SQL

En el **SQL Editor** de Supabase, ejecuta en orden:

```sql
-- 1. Esquema (tablas, trigger)
-- Contenido de: supabase/migrations/001_schema.sql

-- 2. Políticas RLS
-- Contenido de: supabase/migrations/002_rls.sql

-- 3. Funciones auxiliares
-- Contenido de: supabase/migrations/003_functions.sql
```

### 1.3 Seed inicial (DNIs autorizados)

En el SQL Editor, ejecuta `supabase/seed.sql`.
**Edita el archivo antes** y pon los DNIs reales que quieras autorizar.

> ⚠️ El primer usuario que se registre con un DNI autorizado que luego quieras convertir en admin deberá ser promovido manualmente con:
> ```sql
> UPDATE public.profiles SET role = 'admin' WHERE dni = '12345678Z';
> ```

---

## 2. Configurar variables de entorno

Crea/edita el archivo `.env` en la raíz del proyecto:

```env
EXPO_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

---

## 3. Instalar dependencias y ejecutar

```bash
cd c:\Users\carlo\Desktop\fevadis
npm install
npx expo start
```

Escanea el QR con la app **Expo Go** en tu móvil, o pulsa `a` para Android / `i` para iOS en el emulador.

---

## Estructura del proyecto

```
src/
├── components/         # Componentes reutilizables
│   ├── Button.tsx
│   ├── FormInput.tsx
│   ├── EmptyState.tsx
│   ├── RoleBadge.tsx
│   └── StatusBadge.tsx
├── navigation/
│   ├── RootNavigator.tsx   # Navegador principal (4 tabs)
│   └── AdminNavigator.tsx  # Stack del panel de admin (con guard de rol)
├── screens/
│   ├── auth/               # Login (DNI+password), Register (verificación DNI)
│   ├── activities/         # Listado, detalle, mis inscripciones
│   ├── info/               # Pantalla de información estática
│   ├── chats/              # Lista de chats, chat individual (realtime)
│   ├── profile/            # Perfil de usuario
│   └── admin/              # Panel admin: actividades, inscripciones, usuarios, DNIs
├── services/
│   ├── authService.ts      # DNI login, verificar DNI, registro
│   ├── activitiesService.ts
│   ├── registrationsService.ts
│   ├── adminService.ts     # Gestión usuarios y DNIs autorizados
│   └── chatService.ts      # Realtime chat
├── store/
│   └── useAuthStore.ts     # Estado de sesión y perfil (Zustand)
├── types/
│   ├── index.ts            # Todos los tipos de datos
│   └── navigation.ts       # Tipos de navegación
├── utils/
│   ├── supabase.ts         # Cliente Supabase
│   └── dniValidator.ts     # Validación DNI español (formato + letra)
└── theme/
    └── index.ts            # Sistema de diseño (colores, tipografía, espaciado)

supabase/
├── migrations/
│   ├── 001_schema.sql      # Tablas y trigger de creación de perfil
│   ├── 002_rls.sql         # Políticas Row Level Security
│   └── 003_functions.sql   # Funciones auxiliares (check_authorized_dni, safe_change_role...)
└── seed.sql                # DNIs de ejemplo para pruebas
```

---

## Flujo de registro

1. Usuario introduce su DNI en el formulario de registro
2. La app llama a `check_authorized_dni(dni)` (función Supabase SECURITY DEFINER)
3. Si el DNI **no está** en `authorized_dnis` con status `activo` → **bloqueo con mensaje claro**
4. Si está autorizado → aparece el formulario completo (nombre, apellidos, email, contraseña)
5. Al crear la cuenta → `use_authorized_dni(dni, userId)` marca el DNI como `usado`

## Flujo de login

El login es por **DNI + contraseña** (no por email).
La app busca el email asociado al DNI en `profiles` y luego hace `signInWithPassword`.

## Roles

| Rol | Permisos |
|---|---|
| `voluntario` | Ver actividades, inscribirse, ver sus inscripciones y asistencia |
| `editor` | Todo lo anterior + acceso al panel admin (actividades, inscripciones, usuarios, DNIs autorizados) |
| `admin` | Todo lo anterior + protegido como último admin (no se puede degradar si es el único) |

## Dónde tocar las reglas de seguridad

- **Base de datos**: `supabase/migrations/002_rls.sql` (políticas RLS)
- **Funciones privilegiadas**: `supabase/migrations/003_functions.sql`
- **Guard de navegación** (UI): `src/navigation/AdminNavigator.tsx` y `src/screens/profile/ProfileScreen.tsx` (el botón de panel solo aparece para admin/editor)
