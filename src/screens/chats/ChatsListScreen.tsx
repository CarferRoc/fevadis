import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { chatService } from '../../services/chatService';
import { useAuthStore } from '../../store/useAuthStore';
import { Chat } from '../../types';
import { theme } from '../../theme';
import { MessageCircle, Users } from 'lucide-react-native';
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
        <TouchableOpacity
            style={styles.chatRow}
            onPress={() =>
                navigation.navigate('Chat', {
                    chatId: item.id,
                    otherUserName: item.is_group ? (item.name ?? 'Grupo') : 'Chat',
                    isGroup: item.is_group,
                    isAdmin: user?.role === 'admin' || user?.role === 'editor',
                    onlyAdminsCanSpeak: item.only_admins_can_speak
                })
            }
            activeOpacity={0.8}
        >
            <View style={[styles.chatAvatar, item.is_group && { backgroundColor: theme.colors.primary + '15' }]}>
                {item.is_group ? (
                    <Users size={24} color={theme.colors.primary} />
                ) : (
                    <MessageCircle size={24} color={theme.colors.primary} />
                )}
            </View>
            <View style={styles.chatInfo}>
                <Text style={styles.chatTitle}>
                    {item.is_group ? item.name : `Chat #${item.id.substring(0, 8)}`}
                </Text>
                <Text style={styles.lastMessage} numberOfLines={1}>
                    {item.last_message ?? 'Sin mensajes aún'}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Chats</Text>
            </View>

            {isLoading ? (
                <ActivityIndicator
                    style={{ marginTop: 40 }}
                    size="large"
                    color={theme.colors.primary}
                />
            ) : (
                <FlatList
                    data={chats}
                    keyExtractor={(item) => item.id}
                    renderItem={renderChat}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <EmptyState
                            icon="💬"
                            title="Sin chats"
                            subtitle="Aquí aparecerán tus conversaciones."
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
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.md,
        paddingBottom: theme.spacing.sm,
        backgroundColor: theme.colors.surface,
        ...theme.shadow.sm,
    },
    title: { ...theme.typography.h1, color: theme.colors.text },
    list: { paddingVertical: theme.spacing.sm },
    chatRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
        padding: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    chatAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    chatInfo: { flex: 1 },
    chatTitle: { ...theme.typography.h4, color: theme.colors.text },
    lastMessage: { ...theme.typography.bodySmall, color: theme.colors.textSecondary, marginTop: 2 },
});
