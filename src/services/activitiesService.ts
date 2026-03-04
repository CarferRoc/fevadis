import { supabase } from '../utils/supabase';
import { Activity, ActivityCategory } from '../types';

export const activitiesService = {
    async getActivities(categoria?: ActivityCategory | 'Todas') {
        let query = supabase
            .from('activities')
            .select('*')
            .order('fecha_inicio', { ascending: true });

        if (categoria && categoria !== 'Todas') {
            query = query.eq('categoria', categoria);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data as Activity[];
    },

    async getActivityById(id: string) {
        const { data, error } = await supabase
            .from('activities')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as Activity;
    },

    async createActivity(
        activity: Omit<Activity, 'id' | 'created_at' | 'created_by' | 'enrollment_count'>
    ) {
        const { data, error } = await supabase
            .from('activities')
            .insert(activity)
            .select()
            .single();

        if (error) throw error;
        return data as Activity;
    },

    async updateActivity(
        id: string,
        updates: Partial<Omit<Activity, 'id' | 'created_at' | 'created_by'>>
    ) {
        const { data, error } = await supabase
            .from('activities')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Activity;
    },

    async deleteActivity(id: string) {
        const { error } = await supabase
            .from('activities')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async getEnrollmentCount(activityId: string): Promise<number> {
        const { count, error } = await supabase
            .from('registrations')
            .select('*', { count: 'exact', head: true })
            .eq('activity_id', activityId)
            .in('status', ['pendiente', 'aceptado']);

        if (error) throw error;
        return count ?? 0;
    },
};
