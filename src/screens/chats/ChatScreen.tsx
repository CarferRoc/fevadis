import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { chatService } from '../../services/chatService';
import { useAuthStore } from '../../store/useAuthStore';
import { Message, Chat } from '../../types';
import { theme } from '../../theme';
import { Send, Settings } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChatsStackParamList } from '../../types/navigation';

type Route = RouteProp<ChatsStackParamList, 'Chat'>;

export default function ChatScreen() {
    const route = useRoute<Route>();
    const navigation = useNavigation<any>();
    const { chatId, isGroup: paramsIsGroup, isAdmin: paramsIsAdmin, onlyAdminsCanSpeak: paramsOnlyAdmins } = route.params;
    const { user } = useAuthStore();
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);
    const [liveMessages, setLiveMessages] = useState<Message[]>([]);
    const listRef = useRef<FlatList>(null);

    const { data: initialMessages } = useQuery({
        queryKey: ['messages', chatId],
        queryFn: () => chatService.getMessages(chatId),
    });

    const { data: chatDetails } = useQuery({
        queryKey: ['chat-detail', chatId],
        queryFn: async () => {
            const data = await chatService.getChats(user?.id || '');
            return data.find((c: Chat) => c.id === chatId);
        }
    });

    const isGroup = chatDetails ? chatDetails.is_group : paramsIsGroup;
    const groupOnlyAdmins = chatDetails ? chatDetails.only_admins_can_speak : paramsOnlyAdmins;
    const isAdmin = paramsIsAdmin ?? (user?.role === 'admin' || user?.role === 'editor');

    const allMessages = [
        ...(initialMessages ?? []),
        ...liveMessages.filter(
            (m) => !initialMessages?.find((im) => im.id === m.id)
        ),
    ];

    // Realtime subscription
    useEffect(() => {
        const channel = chatService.subscribeToMessages(chatId, (msg) => {
            setLiveMessages((prev) => [...prev, msg]);
        });
        return () => {
            channel.unsubscribe();
        };
    }, [chatId]);

    // Setup Header Settings Button
    React.useLayoutEffect(() => {
        if (isGroup && isAdmin) {
            navigation.setOptions({
                headerRight: () => (
                    <TouchableOpacity
                        onPress={() => navigation.navigate('GroupSettings', { chatId, initialSettings: groupOnlyAdmins })}
                        style={{ marginRight: 10, padding: 5 }}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Settings size={28} color={theme.colors.primary} />
                    </TouchableOpacity>
                ),
            });
        }
    }, [navigation, isGroup, isAdmin, chatId, groupOnlyAdmins]);

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        if (allMessages.length > 0) {
            setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
        }
    }, [allMessages.length]);

    async function handleSend() {
        if (!text.trim() || !user) return;
        setSending(true);
        try {
            await chatService.sendMessage(chatId, user.id, text);
            setText('');
        } catch (e) {
            console.error(e);
        } finally {
            setSending(false);
        }
    }

    const renderMessage = ({ item }: { item: Message }) => {
        const isMe = item.sender_id === user?.id;
        return (
            <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
                <Text style={[styles.bubbleText, isMe ? styles.bubbleTextMe : styles.bubbleTextThem]}>
                    {item.text}
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={90}
            >
                <FlatList
                    ref={listRef}
                    data={allMessages}
                    keyExtractor={(item) => item.id}
                    renderItem={renderMessage}
                    contentContainerStyle={styles.list}
                />

                {/* Input Area or Disabled Notice */}
                {isGroup && groupOnlyAdmins && !isAdmin ? (
                    <View style={styles.disabledInputRow}>
                        <Text style={styles.disabledText}>
                            Solo los administradores pueden enviar mensajes en este grupo.
                        </Text>
                    </View>
                ) : (
                    <View style={styles.inputRow}>
                        <TextInput
                            style={styles.textInput}
                            value={text}
                            onChangeText={setText}
                            placeholder="Escribe un mensaje..."
                            placeholderTextColor={theme.colors.textSecondary}
                            multiline
                            returnKeyType="default"
                        />
                        <TouchableOpacity
                            style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
                            onPress={handleSend}
                            disabled={!text.trim() || sending}
                        >
                            <Send size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    list: { padding: theme.spacing.md, gap: 8 },
    bubble: {
        maxWidth: '80%',
        borderRadius: 16,
        paddingVertical: 10,
        paddingHorizontal: 14,
        marginVertical: 2,
    },
    bubbleMe: {
        alignSelf: 'flex-end',
        backgroundColor: theme.colors.primary,
        borderBottomRightRadius: 4,
    },
    bubbleThem: {
        alignSelf: 'flex-start',
        backgroundColor: theme.colors.surface,
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    bubbleText: { fontSize: 15, lineHeight: 22 },
    bubbleTextMe: { color: '#fff' },
    bubbleTextThem: { color: theme.colors.text },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: theme.spacing.sm,
        padding: theme.spacing.md,
        backgroundColor: theme.colors.surface,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    textInput: {
        flex: 1,
        backgroundColor: theme.colors.background,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 15,
        maxHeight: 100,
        color: theme.colors.text,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    sendBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendBtnDisabled: { opacity: 0.5 },
    disabledInputRow: {
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.surface,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    disabledText: {
        ...theme.typography.bodySmall,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        fontStyle: 'italic',
    },
});
