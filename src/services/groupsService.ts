import { supabase } from '../utils/supabase';

export interface Group {
    id: string;
    name: string;
    description?: string;
    image_url?: string;
    created_by: string;
    created_at: string;
}

export interface GroupMember {
    group_id: string;
    user_id: string;
    role: 'admin' | 'member';
    profile?: any;
}

export interface GroupMessage {
    id: string;
    group_id: string;
    user_id: string;
    content: string;
    created_at: string;
    profile?: any;
}

export const groupsService = {
    async getGroups() {
        const { data, error } = await supabase
            .from('groups')
            .select('*, group_members(count)');
        if (error) throw error;
        return data;
    },

    async createGroup(name: string, description: string, userId: string) {
        const { data, error } = await supabase
            .from('groups')
            .insert({ name, description, created_by: userId })
            .select()
            .single();

        if (error) throw error;

        // Add creator as admin
        await this.addGroupMember(data.id, userId, 'admin');

        return data;
    },

    async addGroupMember(groupId: string, userId: string, role: 'admin' | 'member' = 'member') {
        const { error } = await supabase
            .from('group_members')
            .insert({ group_id: groupId, user_id: userId, role });
        if (error) throw error;
    },

    async getGroupDetails(groupId: string) {
        const { data, error } = await supabase
            .from('groups')
            .select('*, group_members(*, profiles(*))')
            .eq('id', groupId)
            .single();
        if (error) throw error;
        return data;
    },

    async getMessages(groupId: string) {
        const { data, error } = await supabase
            .from('group_messages')
            .select('*, profiles(first_name, last_name)')
            .eq('group_id', groupId)
            .order('created_at', { ascending: true });
        if (error) throw error;
        return data;
    },

    async sendMessage(groupId: string, userId: string, content: string) {
        const { error } = await supabase
            .from('group_messages')
            .insert({ group_id: groupId, user_id: userId, content });
        if (error) throw error;
    }
};
