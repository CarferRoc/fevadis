// ─── Roles ───────────────────────────────────────────────────────────────────
export type UserRole = 'admin' | 'editor' | 'voluntario';

// ─── Profile ─────────────────────────────────────────────────────────────────
export interface Profile {
    user_id: string;
    nombre: string;
    apellidos: string;
    email: string;
    dni: string;
    telefono?: string;
    role: UserRole;
    created_at: string;
}

// ─── Authorized DNI ──────────────────────────────────────────────────────────
export type AuthorizedDniStatus = 'activo' | 'usado' | 'revocado';

export interface AuthorizedDni {
    id: string;
    dni: string;
    status: AuthorizedDniStatus;
    created_at: string;
    created_by: string;
    used_by?: string | null;
    used_at?: string | null;
}

// ─── Activity ─────────────────────────────────────────────────────────────────
export type ActivityCategory = 'Ocio' | 'Campamentos' | 'Formaciones' | 'Talleres';

export interface Activity {
    id: string;
    titulo: string;
    descripcion?: string | null;
    categoria: ActivityCategory;
    fecha_inicio: string; // ISO timestamp
    fecha_fin: string;    // ISO timestamp
    ubicacion?: string | null;
    plazas: number;
    created_by: string;
    created_at: string;
    // Virtual field from joined query
    enrollment_count?: number;
}

// ─── Registration (Inscripción) ───────────────────────────────────────────────
export type RegistrationStatus = 'pendiente' | 'aceptado' | 'rechazado' | 'lista_espera';
export type AttendanceStatus = 'pendiente' | 'asistio' | 'no_asistio';

export interface Registration {
    id: string;
    activity_id: string;
    user_id: string;
    status: RegistrationStatus;
    attendance: AttendanceStatus;
    created_at: string;
    updated_at: string;
    reviewed_by?: string | null;
    reviewed_at?: string | null;
    attendance_marked_by?: string | null;
    attendance_marked_at?: string | null;
    // Joined fields
    activity?: Pick<Activity, 'id' | 'titulo' | 'fecha_inicio' | 'fecha_fin' | 'ubicacion'>;
    profile?: Pick<Profile, 'user_id' | 'nombre' | 'apellidos' | 'email' | 'dni'>;
}

// ─── Chat ─────────────────────────────────────────────────────────────────────
export interface Chat {
    id: string;
    participants: string[]; // array of user_ids
    last_message?: string | null;
    is_group?: boolean;
    name?: string | null;
    admin_id?: string | null;
    only_admins_can_speak?: boolean;
    updated_at: string;
    created_at: string;
}

export interface Message {
    id: string;
    chat_id: string;
    sender_id: string;
    text: string;
    created_at: string;
}

// ─── Rewards ──────────────────────────────────────────────────────────────────
export interface Reward {
    id: string;
    titulo: string;
    descripcion?: string | null;
    costo_puntos: number;
    stock?: number | null;
    image_url?: string | null;
    created_at: string;
    created_by?: string | null;
}
