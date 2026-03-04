import { supabase } from '../utils/supabase';

export interface Profile {
    id: string; // uuid
    user_id: string;
    nombre: string;
    apellidos: string;
    email?: string;
    dni?: string;
    telefono?: string;
    role?: string;
}

export const usersService = {
    async getUsers() {
        // RLS might restrict this to admins or authenticated users.
        // Assuming 'profiles' are viewable by authenticated users.
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('first_name', { ascending: true });

        if (error) throw error;
        return data as Profile[];
    },

    async searchUsers(query: string) {
        if (!query) return [];
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .or(`nombre.ilike.%${query}%,apellidos.ilike.%${query}%`)
            .limit(20);

        if (error) throw error;
        return data as Profile[];
    }
};
