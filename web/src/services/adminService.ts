import { supabase } from '../utils/supabase';
import type { Profile, AuthorizedDni, AuthorizedDniStatus, UserRole } from '../types';
import { formatDni } from '../utils/dniValidator';

export const adminService = {
    async getUsers() {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('nombre', { ascending: true });
        if (error) throw error;
        return data as Profile[];
    },

    async changeRole(targetUserId: string, newRole: UserRole) {
        const { data, error } = await supabase.rpc('safe_change_role', {
            p_target_user_id: targetUserId,
            p_new_role: newRole,
        });
        if (error) throw new Error(error.message);
        return data;
    },

    async getAuthorizedDnis() {
        const { data, error } = await supabase
            .from('authorized_dnis')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data as AuthorizedDni[];
    },

    async addAuthorizedDni(dni: string, createdBy: string) {
        const normalizedDni = formatDni(dni);
        const { data, error } = await supabase
            .from('authorized_dnis')
            .insert({
                dni: normalizedDni,
                status: 'activo' as AuthorizedDniStatus,
                created_by: createdBy,
            })
            .select()
            .single();
        if (error) throw new Error(error.message);
        return data as AuthorizedDni;
    },

    async revokeAuthorizedDni(id: string) {
        const { error } = await supabase
            .from('authorized_dnis')
            .update({ status: 'revocado' as AuthorizedDniStatus })
            .eq('id', id);
        if (error) throw new Error(error.message);
    },

    async deleteAuthorizedDni(id: string) {
        const { error } = await supabase.from('authorized_dnis').delete().eq('id', id);
        if (error) throw new Error(error.message);
    },
};
