import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Pressable,
    ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { chatService } from '../../services/chatService';
import { useAuthStore } from '../../store/useAuthStore';
import { Chat } from '../../types';
import { theme } from '../../theme';
import { MessageSquare, Users } from 'lucide-react-native';
import { EmptyState } from '../../components/EmptyState';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChatsStackParamList } from '../../types/navigation';

type Nav = NativeStackNavigationProp<ChatsStackParamList, 'ChatsList'>;

export default function ChatsListScreen() {
    const { user } = useAuthStore();
    const navigation = useNavigation<Nav>();

    const { data: chats, isLoading } = useQuery({
        queryKey: ['chats', user?.id],
        queryFn: () => (user ? chatService.getChats(user.id) : []),
        enabled: !!user,
    });

    const renderChat = ({ item }: { item: Chat }) => (
        <Pressable
            style={({ pressed }) => [styles.chatRow, pressed && styles.chatRowPressed]}
            onPress={() =>
                navigation.navigate('Chat', {
                    chatId: item.id,
                    otherUserName: item.is_group ? (item.name ?? 'Grupo') : 'Chat',
                    isGroup: item.is_group,
                    isAdmin: user?.role === 'admin' || user?.role === 'editor',
                    onlyAdminsCanSpeak: item.only_admins_can_speak
                })
            }
        >
            <View
                style={[
                    styles.chatAvatar,
                    { backgroundColor: item.is_group ? theme.colors.primaryLight : theme.colors.primarySoft },
                ]}
            >
                {item.is_group ? (
                    <Users size={18} color={theme.colors.primaryDark} strokeWidth={2.2} />
                ) : (
                    <MessageSquare size={18} color={theme.colors.primaryDark} strokeWidth={2.2} />
                )}
            </View>
            <View style={styles.chatInfo}>
                <Text style={styles.chatTitle} numberOfLines={1}>
                    {item.is_group ? item.name : `Chat #${item.id.substring(0, 8)}`}
                </Text>
                <Text style={styles.lastMessage} numberOfLines={1}>
                    {item.last_message ?? 'Sin mensajes aún'}
                </Text>
            </View>
        </Pressable>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.title}>Chats</Text>
                <Text style={styles.subtitle}>Tus conversaciones y grupos</Text>
            </View>

            {isLoading ? (
                <ActivityIndicator
                    style={{ marginTop: 40 }}
                    size="small"
                    color={theme.colors.primary}
                />
            ) : (
                <FlatList
                    data={chats}
                    keyExtractor={(item) => item.id}
                    renderItem={renderChat}
                    contentContainerStyle={styles.list}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    ListEmptyComponent={
                        <EmptyState
                            icon="💬"
                            title="Sin chats"
                            subtitle="Aquí aparecerán tus conversaciones cuando te añadan."
                        />
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: {
        paddingHorizontal: 18,
        paddingTop: 10,
        paddingBottom: 14,
    },
    title: {
        ...theme.typography.display,
        color: theme.colors.text,
    },
    subtitle: {
        ...theme.typography.bodySmall,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    list: {
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    chatRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderRadius: theme.radius.lg,
    },
    chatRowPressed: {
        backgroundColor: theme.colors.primarySoft,
    },
    chatAvatar: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    chatInfo: { flex: 1 },
    chatTitle: {
        ...theme.typography.bodyStrong,
        color: theme.colors.text,
    },
    lastMessage: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    separator: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginLeft: 66,
    },
});
