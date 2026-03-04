import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupsService, GroupMessage } from '../../services/groupsService';
import { Screen } from '../../components/Screen';
import { theme } from '../../theme';
import { Send, Users } from 'lucide-react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../utils/supabase';

export default function GroupDetailScreen() {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { groupId, title } = route.params;
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const [message, setMessage] = useState('');
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        navigation.setOptions({ title: title });

        // Subscribe to real-time changes
        const subscription = supabase
            .channel(`group_messages:${groupId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'group_messages',
                    filter: `group_id=eq.${groupId}`,
                },
                (payload: any) => {
                    // Refetch messages when a new one comes in
                    queryClient.invalidateQueries({ queryKey: ['groupMessages', groupId] });
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [groupId]);

    const { data: messages, isLoading } = useQuery({
        queryKey: ['groupMessages', groupId],
        queryFn: () => groupsService.getMessages(groupId),
    });

    const sendMessageMutation = useMutation({
        mutationFn: (content: string) => groupsService.sendMessage(groupId, user!.id, content),
        onSuccess: () => {
            setMessage('');
            queryClient.invalidateQueries({ queryKey: ['groupMessages', groupId] });
        },
    });

    const handleSend = () => {
        if (!message.trim()) return;
        sendMessageMutation.mutate(message);
    };

    const renderItem = ({ item }: { item: GroupMessage & { profiles: any } }) => {
        const isMe = item.user_id === user?.id;
        return (
            <View style={[styles.messageRow, isMe ? styles.myMessageRow : styles.otherMessageRow]}>
                {!isMe && <Text style={styles.sender}>{item.profiles?.first_name}</Text>}
                <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}>
                    <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.otherMessageText]}>
                        {item.content}
                    </Text>
                    <Text style={[styles.time, isMe ? styles.myTime : styles.otherTime]}>
                        {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <Screen safeArea={false} style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={{ fontSize: 24, marginRight: 10 }}>←</Text>
                </TouchableOpacity>
                <Text style={styles.title}>{title}</Text>
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Type a message..."
                        value={message}
                        onChangeText={setMessage}
                        multiline
                    />
                    <TouchableOpacity onPress={handleSend} style={styles.sendBtn} disabled={!message.trim()}>
                        <Send color={message.trim() ? theme.colors.primary : theme.colors.textSecondary} size={24} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: {
        flexDirection: 'row', alignItems: 'center',
        paddingTop: 50, paddingBottom: 15, paddingHorizontal: 15,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1, borderBottomColor: theme.colors.border
    },
    title: { fontSize: 18, fontWeight: '600' },
    list: { padding: 15, paddingBottom: 20 },
    messageRow: { marginBottom: 10, maxWidth: '80%' },
    myMessageRow: { alignSelf: 'flex-end', alignItems: 'flex-end' },
    otherMessageRow: { alignSelf: 'flex-start', alignItems: 'flex-start' },
    sender: { fontSize: 12, color: theme.colors.textSecondary, marginBottom: 2, marginLeft: 10 },
    bubble: { padding: 10, borderRadius: 15 },
    myBubble: { backgroundColor: theme.colors.primary, borderBottomRightRadius: 2 },
    otherBubble: { backgroundColor: theme.colors.surface, borderBottomLeftRadius: 2 },
    messageText: { fontSize: 15 },
    myMessageText: { color: '#fff' },
    otherMessageText: { color: theme.colors.text },
    time: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
    myTime: { color: 'rgba(255,255,255,0.7)' },
    otherTime: { color: theme.colors.textSecondary },
    inputContainer: {
        flexDirection: 'row', alignItems: 'center',
        padding: 10, backgroundColor: theme.colors.surface,
        borderTopWidth: 1, borderTopColor: theme.colors.border
    },
    input: {
        flex: 1, backgroundColor: theme.colors.background,
        borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10,
        maxHeight: 100, marginRight: 10
    },
    sendBtn: { padding: 5 }
});
