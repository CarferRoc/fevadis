import { supabase } from '../utils/supabase';
import { Chat, Message } from '../types';
import { RealtimeChannel } from '@supabase/supabase-js';

export const chatService = {
    async getChats(userId: string) {
        const { data, error } = await supabase
            .from('chats')
            .select('*')
            .contains('participants', [userId])
            .order('updated_at', { ascending: false });

        if (error) throw error;
        return data as Chat[];
    },

    async getOrCreateDirectChat(userId1: string, userId2: string) {
        // Check if a chat already exists between these two users
        const { data: existing } = await supabase
            .from('chats')
            .select('*')
            .contains('participants', [userId1, userId2]);

        if (existing && existing.length > 0) {
            // Filter to find exact match (only these 2 participants)
            const direct = existing.find(
                (c: Chat) => c.participants.length === 2
            );
            if (direct) return direct as Chat;
        }

        // Create new chat
        const { data, error } = await supabase
            .from('chats')
            .insert({
                participants: [userId1, userId2],
                last_message: null,
                is_group: false,
            })
            .select()
            .single();

        if (error) throw error;
        return data as Chat;
    },

    async createGroupChat(name: string, participants: string[], adminId: string) {
        if (!participants.includes(adminId)) {
            participants.push(adminId);
        }

        const { data, error } = await supabase
            .from('chats')
            .insert({
                participants,
                name,
                is_group: true,
                admin_id: adminId,
                last_message: null,
            })
            .select()
            .single();

        if (error) throw error;
        return data as Chat;
    },

    async getAdminGroupChats() {
        const { data, error } = await supabase
            .from('chats')
            .select('*')
            .eq('is_group', true)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Chat[];
    },

    async updateGroupSettings(chatId: string, onlyAdminsCanSpeak: boolean) {
        const { error } = await supabase
            .from('chats')
            .update({ only_admins_can_speak: onlyAdminsCanSpeak })
            .eq('id', chatId);

        if (error) throw error;
    },

    async deleteChat(chatId: string) {
        const { error } = await supabase
            .from('chats')
            .delete()
            .eq('id', chatId);

        if (error) throw error;
    },

    async getMessages(chatId: string) {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('chat_id', chatId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data as Message[];
    },

    async sendMessage(chatId: string, senderId: string, text: string) {
        const trimmed = text.trim();
        if (!trimmed) throw new Error('El mensaje no puede estar vacío');

        const { data, error } = await supabase
            .from('messages')
            .insert({
                chat_id: chatId,
                sender_id: senderId,
                text: trimmed,
            })
            .select()
            .single();

        if (error) throw error;

        // Update last_message in chat
        await supabase
            .from('chats')
            .update({
                last_message: trimmed,
                updated_at: new Date().toISOString(),
            })
            .eq('id', chatId);

        return data as Message;
    },

    subscribeToMessages(
        chatId: string,
        onMessage: (msg: Message) => void
    ): RealtimeChannel {
        return supabase
            .channel(`messages:${chatId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `chat_id=eq.${chatId}`,
                },
                (payload) => {
                    onMessage(payload.new as Message);
                }
            )
            .subscribe();
    },
};
