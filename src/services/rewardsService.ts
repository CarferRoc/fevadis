import { supabase } from '../utils/supabase';
import { Reward } from '../types';

export const rewardsService = {
    async getAllRewards() {
        const { data, error } = await supabase
            .from('rewards')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Reward[];
    },

    async createReward(reward: Omit<Reward, 'id' | 'created_at'>) {
        const { data, error } = await supabase
            .from('rewards')
            .insert([reward])
            .select()
            .single();

        if (error) throw error;
        return data as Reward;
    },

    async updateReward(id: string, updates: Partial<Omit<Reward, 'id' | 'created_at' | 'created_by'>>) {
        const { data, error } = await supabase
            .from('rewards')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Reward;
    },

    async deleteReward(id: string) {
        const { error } = await supabase
            .from('rewards')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
