import { supabase } from '../utils/supabase';
import type { Profile } from '../types';

export const usersService = {
    async getUsers() {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('nombre', { ascending: true });
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
    },
};
