import React, { useState, useEffect, useRef, useMemo } from 'react';
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

// Tonos para los nombres (para distinguir remitentes sin ser ruidoso)
const NAME_COLORS = [
    '#3E7CB1', '#D48712', '#7A52B4', '#D64C8A',
    '#558A2D', '#3E7A1A', '#A62F2F', '#4E4696',
];

function colorForId(id: string) {
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = (hash << 5) - hash + id.charCodeAt(i);
    return NAME_COLORS[Math.abs(hash) % NAME_COLORS.length];
}

export default function ChatScreen() {
    const route = useRoute<Route>();
    const navigation = useNavigation<any>();
    const {
        chatId,
        isGroup: paramsIsGroup,
        isAdmin: paramsIsAdmin,
        onlyAdminsCanSpeak: paramsOnlyAdmins,
    } = route.params;
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
        },
    });

    const isGroup = chatDetails ? chatDetails.is_group : paramsIsGroup;
    const groupOnlyAdmins = chatDetails ? chatDetails.only_admins_can_speak : paramsOnlyAdmins;
    const isAdmin = paramsIsAdmin ?? (user?.role === 'admin' || user?.role === 'editor');

    const { data: profiles } = useQuery({
        queryKey: ['chat-participants', chatId],
        queryFn: () => chatService.getChatParticipants(chatId),
        enabled: !!chatId,
    });

    const profileMap = useMemo(() => {
        const map = new Map<string, { nombre: string; apellidos: string; role: string }>();
        profiles?.forEach((p) => map.set(p.user_id, p));
        return map;
    }, [profiles]);

    const allMessages = useMemo(
        () => [
            ...(initialMessages ?? []),
            ...liveMessages.filter((m) => !initialMessages?.find((im) => im.id === m.id)),
        ],
        [initialMessages, liveMessages]
    );

    useEffect(() => {
        const channel = chatService.subscribeToMessages(chatId, (msg) => {
            setLiveMessages((prev) => [...prev, msg]);
        });
        return () => {
            channel.unsubscribe();
        };
    }, [chatId]);

    React.useLayoutEffect(() => {
        if (isGroup && isAdmin) {
            navigation.setOptions({
                headerRight: () => (
                    <TouchableOpacity
                        onPress={() => navigation.navigate('GroupSettings', { chatId, initialSettings: groupOnlyAdmins })}
                        style={{ marginRight: 10, padding: 5 }}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Settings size={22} color="#fff" />
                    </TouchableOpacity>
                ),
            });
        }
    }, [navigation, isGroup, isAdmin, chatId, groupOnlyAdmins]);

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

    const renderMessage = ({ item, index }: { item: Message; index: number }) => {
        const isMe = item.sender_id === user?.id;
        const prev = allMessages[index - 1];
        const sameAuthor = prev && prev.sender_id === item.sender_id;
        const profile = profileMap.get(item.sender_id);
        const senderName = profile
            ? `${profile.nombre} ${profile.apellidos}`.trim() || 'Usuario'
            : 'Usuario';
        const showSender = !isMe && !sameAuthor;
        const showMe = isMe && !sameAuthor;

        return (
            <View
                style={[
                    styles.msgWrap,
                    isMe ? styles.msgWrapMe : styles.msgWrapThem,
                    sameAuthor && styles.msgWrapGrouped,
                ]}
            >
                {showSender && (
                    <Text style={[styles.senderName, { color: colorForId(item.sender_id) }]}>
                        {senderName}
                        {profile?.role && profile.role !== 'voluntario' ? (
                            <Text style={styles.senderRole}> · {profile.role}</Text>
                        ) : null}
                    </Text>
                )}
                {showMe && <Text style={styles.senderMe}>Tú</Text>}
                <View
                    style={[
                        styles.bubble,
                        isMe ? styles.bubbleMe : styles.bubbleThem,
                        sameAuthor && (isMe ? styles.bubbleMeCont : styles.bubbleThemCont),
                    ]}
                >
                    <Text style={[styles.bubbleText, isMe ? styles.bubbleTextMe : styles.bubbleTextThem]}>
                        {item.text}
                    </Text>
                </View>
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
                            placeholderTextColor={theme.colors.textTertiary}
                            multiline
                            returnKeyType="default"
                        />
                        <TouchableOpacity
                            style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
                            onPress={handleSend}
                            disabled={!text.trim() || sending}
                        >
                            <Send size={18} color="#fff" />
                        </TouchableOpacity>
                    </View>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    list: { padding: 14, paddingBottom: 10 },

    msgWrap: {
        marginTop: 10,
        maxWidth: '82%',
    },
    msgWrapGrouped: {
        marginTop: 2,
    },
    msgWrapMe: {
        alignSelf: 'flex-end',
        alignItems: 'flex-end',
    },
    msgWrapThem: {
        alignSelf: 'flex-start',
        alignItems: 'flex-start',
    },
    senderName: {
        fontSize: 12,
        fontWeight: '700',
        marginLeft: 10,
        marginBottom: 3,
    },
    senderRole: {
        fontSize: 11,
        fontWeight: '600',
        color: theme.colors.textTertiary,
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },
    senderMe: {
        fontSize: 11,
        fontWeight: '700',
        color: theme.colors.textTertiary,
        marginRight: 10,
        marginBottom: 3,
    },

    bubble: {
        borderRadius: 16,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    bubbleMe: {
        backgroundColor: theme.colors.primary,
        borderBottomRightRadius: 6,
    },
    bubbleMeCont: {
        borderTopRightRadius: 6,
    },
    bubbleThem: {
        backgroundColor: theme.colors.surface,
        borderBottomLeftRadius: 6,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    bubbleThemCont: {
        borderTopLeftRadius: 6,
    },
    bubbleText: { fontSize: 14, lineHeight: 20 },
    bubbleTextMe: { color: '#fff', fontWeight: '500' },
    bubbleTextThem: { color: theme.colors.text },

    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: theme.colors.surface,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    textInput: {
        flex: 1,
        backgroundColor: theme.colors.surfaceAlt,
        borderRadius: theme.radius.lg,
        paddingHorizontal: 14,
        paddingVertical: 9,
        fontSize: 14,
        maxHeight: 100,
        color: theme.colors.text,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    sendBtn: {
        width: 38,
        height: 38,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendBtnDisabled: { opacity: 0.4 },
    disabledInputRow: {
        padding: 14,
        backgroundColor: theme.colors.surfaceMuted,
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
