import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Gift, Plus, Edit2, Trash2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { AdminStackParamList } from '../../types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { rewardsService } from '../../services/rewardsService';
import { Reward } from '../../types';
import { theme } from '../../theme';
import { EmptyState } from '../../components/EmptyState';
import { Button } from '../../components/Button';

type Nav = NativeStackNavigationProp<AdminStackParamList, 'AdminRewards'>;

export default function AdminRewardsScreen() {
    const navigation = useNavigation<Nav>();
    const queryClient = useQueryClient();

    const { data: rewards, isLoading, isRefetching, refetch } = useQuery({
        queryKey: ['admin-rewards'],
        queryFn: rewardsService.getAllRewards,
    });

    const deleteMutation = useMutation({
        mutationFn: rewardsService.deleteReward,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-rewards'] });
            Alert.alert('Éxito', 'Recompensa eliminada correctamente');
        },
        onError: (error: any) => {
            Alert.alert('Error', error.message);
        },
    });

    const handleDelete = (id: string) => {
        Alert.alert(
            'Eliminar recompensa',
            '¿Estás seguro de que quieres eliminar esta recompensa?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Eliminar', style: 'destructive', onPress: () => deleteMutation.mutate(id) },
            ]
        );
    };

    const renderItem = ({ item }: { item: Reward }) => (
        <View style={styles.card}>
            <View style={styles.cardContent}>
                <View style={styles.headerRow}>
                    <Text style={styles.title}>{item.titulo}</Text>
                    <View style={styles.pointsBadge}>
                        <Gift size={12} color={theme.colors.accent} />
                        <Text style={styles.pointsText}>{item.costo_puntos} pts</Text>
                    </View>
                </View>
                {item.descripcion && (
                    <Text style={styles.description} numberOfLines={2}>{item.descripcion}</Text>
                )}
                <Text style={styles.stock}>
                    Stock: {item.stock === null ? 'Ilimitado' : item.stock}
                </Text>
            </View>

            <View style={styles.actionRow}>
                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: theme.colors.primaryLight + '20' }]}
                    onPress={() => navigation.navigate('AdminRewardForm', { rewardId: item.id })}
                >
                    <Edit2 size={16} color={theme.colors.primary} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: theme.colors.error + '10' }]}
                    onPress={() => handleDelete(item.id)}
                >
                    <Trash2 size={16} color={theme.colors.error} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Gestión de Recompensas</Text>
                <Button
                    title="Nueva Recompensa"
                    onPress={() => navigation.navigate('AdminRewardForm', {})}
                />
            </View>

            <FlatList
                data={rewards}
                keyExtractor={(i) => i.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[theme.colors.primary]} />
                }
                ListEmptyComponent={
                    isLoading ? null : (
                        <EmptyState
                            icon="🎁"
                            title="Sin recompensas"
                            subtitle="Empieza creando la primera recompensa."
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
        borderLeftColor: theme.colors.accent,
        ...theme.shadow.sm,
    },
    cardContent: { marginBottom: theme.spacing.sm },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
    title: { ...theme.typography.h3, color: theme.colors.text, flex: 1, marginRight: 8 },
    pointsBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.accent + '20',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: theme.borderRadius.full,
        gap: 6,
    },
    pointsText: { ...theme.typography.label, color: theme.colors.accent, fontWeight: '800' },
    description: { ...theme.typography.body, color: theme.colors.textSecondary, marginBottom: 10, lineHeight: 20 },
    stock: { ...theme.typography.label, color: theme.colors.textTertiary },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
        paddingTop: theme.spacing.sm,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        justifyContent: 'flex-end',
    },
    actionBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: theme.borderRadius.md,
    },
});
