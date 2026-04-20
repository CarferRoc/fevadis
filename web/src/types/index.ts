export type UserRole = 'admin' | 'editor' | 'voluntario';

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

export type ActivityCategory = 'Ocio' | 'Campamentos' | 'Formaciones' | 'Talleres';

export interface Activity {
    id: string;
    titulo: string;
    descripcion?: string | null;
    categoria: ActivityCategory;
    fecha_inicio: string;
    fecha_fin: string;
    ubicacion?: string | null;
    plazas: number;
    created_by: string;
    created_at: string;
    enrollment_count?: number;
}

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
    activity?: Pick<Activity, 'id' | 'titulo' | 'fecha_inicio' | 'fecha_fin' | 'ubicacion'> & { plazas?: number };
    profile?: Pick<Profile, 'user_id' | 'nombre' | 'apellidos' | 'email' | 'dni'>;
}

export interface Chat {
    id: string;
    participants: string[];
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

export interface InfoDocument {
    id: string;
    title: string;
    category: string;
    url: string;
    file_type: string | null;
    file_size: number | null;
    uploaded_by: string | null;
    created_at: string;
}

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
