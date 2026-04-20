import { supabase } from '../utils/supabase';
import type { Registration, RegistrationStatus, AttendanceStatus } from '../types';

export const registrationsService = {
    async getMyRegistrations(userId: string) {
        const { data, error } = await supabase
            .from('registrations')
            .select(`
                *,
                activity:activities(id, titulo, fecha_inicio, fecha_fin, ubicacion, plazas)
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data as Registration[];
    },

    async getMyRegistrationForActivity(userId: string, activityId: string) {
        const { data, error } = await supabase
            .from('registrations')
            .select('*')
            .eq('user_id', userId)
            .eq('activity_id', activityId)
            .maybeSingle();
        if (error) throw error;
        return data as Registration | null;
    },

    async getAllRegistrations() {
        const { data, error } = await supabase
            .from('registrations')
            .select(`
                *,
                activity:activities(id, titulo, fecha_inicio, fecha_fin),
                profile:profiles!registrations_user_id_fkey(user_id, nombre, apellidos, email, dni)
            `)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data as Registration[];
    },

    async getRegistrationsForActivity(activityId: string) {
        const { data, error } = await supabase
            .from('registrations')
            .select(`
                *,
                profile:profiles!registrations_user_id_fkey(user_id, nombre, apellidos, email, dni)
            `)
            .eq('activity_id', activityId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data as Registration[];
    },

    async createRegistration(activityId: string, userId: string) {
        const { data, error } = await supabase
            .from('registrations')
            .insert({
                activity_id: activityId,
                user_id: userId,
                status: 'pendiente' as RegistrationStatus,
                attendance: 'pendiente' as AttendanceStatus,
            })
            .select()
            .single();
        if (error) throw error;
        return data as Registration;
    },

    async updateStatus(id: string, status: RegistrationStatus, reviewedBy: string) {
        const { data, error } = await supabase
            .from('registrations')
            .update({
                status,
                reviewed_by: reviewedBy,
                reviewed_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data as Registration;
    },

    async markAttendance(id: string, attendance: AttendanceStatus, markedBy: string) {
        const { data, error } = await supabase
            .from('registrations')
            .update({
                attendance,
                attendance_marked_by: markedBy,
                attendance_marked_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data as Registration;
    },
};
