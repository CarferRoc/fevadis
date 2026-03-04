import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageCircle, Plus, Trash2, Users } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { AdminStackParamList } from '../../types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { chatService } from '../../services/chatService';
import { Chat } from '../../types';
import { theme } from '../../theme';
import { EmptyState } from '../../components/EmptyState';
import { Button } from '../../components/Button';

type Nav = NativeStackNavigationProp<AdminStackParamList, 'AdminGroupChats'>;

export default function AdminGroupChatsScreen() {
    const navigation = useNavigation<Nav>();
    const queryClient = useQueryClient();

    const { data: groups, isLoading, isRefetching, refetch } = useQuery({
        queryKey: ['admin-groups'],
        queryFn: chatService.getAdminGroupChats,
    });

    const deleteMutation = useMutation({
        mutationFn: chatService.deleteChat,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-groups'] });
            queryClient.invalidateQueries({ queryKey: ['chats'] }); // Force user chats to reload
            Alert.alert('Éxito', 'Grupo eliminado correctamente');
        },
        onError: (error: any) => {
            Alert.alert('Error', error.message);
        },
    });

    const handleDelete = (id: string) => {
        Alert.alert(
            'Eliminar grupo',
            '¿Estás seguro de que quieres eliminar este grupo de chat? Se borrarán todos los mensajes.',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Eliminar', style: 'destructive', onPress: () => deleteMutation.mutate(id) },
            ]
        );
    };

    const renderItem = ({ item }: { item: Chat }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => {
                // Navegar a ChatScreen pasando los parámetros necesarios para que funcione el modo mute
                // Necesitamos usar la navegación general aquí
                (navigation as any).navigate('Chats', {
                    screen: 'Chat',
                    params: {
                        chatId: item.id,
                        otherUserName: item.name ?? 'Grupo',
                        isGroup: true,
                        isAdmin: true,
                        onlyAdminsCanSpeak: item.only_admins_can_speak,
                    }
                });
            }}
        >
            <View style={styles.cardContent}>
                <View style={styles.headerRow}>
                    <Text style={styles.title}>{item.name ?? 'Grupo sin nombre'}</Text>
                    <View style={styles.participantsBadge}>
                        <Users size={12} color={theme.colors.accent} />
                        <Text style={styles.participantsText}>{item.participants.length} usuarios</Text>
                    </View>
                </View>
                <Text style={styles.description} numberOfLines={1}>
                    {item.last_message || 'No hay mensajes todavía'}
                </Text>
            </View>

            <View style={styles.actionRow}>
                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: theme.colors.error + '10' }]}
                    onPress={(e) => {
                        e.stopPropagation(); // Evitar que el click en la basura abra el chat
                        handleDelete(item.id);
                    }}
                >
                    <Trash2 size={16} color={theme.colors.error} />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Chats Grupales</Text>
                <Button
                    title="Nuevo Grupo"
                    onPress={() => navigation.navigate('AdminCreateGroupChat')}
                />
            </View>

            <FlatList
                data={groups}
                keyExtractor={(i) => i.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[theme.colors.primary]} />
                }
                ListEmptyComponent={
                    isLoading ? null : (
                        <EmptyState
                            icon="💬"
                            title="Sin grupos"
                            subtitle="Empieza creando un nuevo grupo de chat para organizarte."
                        />
                    )
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: theme.spacing.lg,
        paddingTop: theme.spacing.xl,
        backgroundColor: theme.colors.primary,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    headerTitle: { ...theme.typography.h2, color: '#fff' },
    list: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xl * 3 },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.primary,
        ...theme.shadow.sm,
    },
    cardContent: { marginBottom: theme.spacing.sm },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
    title: { ...theme.typography.h3, color: theme.colors.text, flex: 1, marginRight: 8 },
    participantsBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.accent + '20',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: theme.borderRadius.full,
        gap: 6,
    },
    participantsText: { ...theme.typography.label, color: theme.colors.accent, fontWeight: '700' },
    description: { ...theme.typography.body, color: theme.colors.textSecondary, marginBottom: 4, lineHeight: 20 },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
        paddingTop: theme.spacing.sm,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        justifyContent: 'flex-end',
    },
    actionBtn: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: theme.borderRadius.md,
    },
});
