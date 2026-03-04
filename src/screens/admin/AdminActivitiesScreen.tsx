import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Alert,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../types/navigation';
import { activitiesService } from '../../services/activitiesService';
import { theme } from '../../theme';
import { Activity } from '../../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus, Pencil, Trash2 } from 'lucide-react-native';
import { EmptyState } from '../../components/EmptyState';

type Nav = NativeStackNavigationProp<AdminStackParamList, 'AdminActivities'>;

export default function AdminActivitiesScreen() {
    const navigation = useNavigation<Nav>();
    const { data: activities, isLoading, refetch } = useQuery({
        queryKey: ['admin-activities'],
        queryFn: () => activitiesService.getActivities(),
    });

    async function handleDelete(activity: Activity) {
        Alert.alert(
            'Eliminar actividad',
            `¿Seguro que quieres eliminar "${activity.titulo}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await activitiesService.deleteActivity(activity.id);
                            refetch();
                        } catch (e: any) {
                            Alert.alert('Error', e.message);
                        }
                    },
                },
            ]
        );
    }

    const renderItem = ({ item }: { item: Activity }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.catPill}>
                    <Text style={styles.catText}>{item.categoria}</Text>
                </View>
                <Text style={styles.dateText}>
                    {format(new Date(item.fecha_inicio), 'd MMM yyyy', { locale: es })}
                </Text>
            </View>

            <Text style={styles.titulo} numberOfLines={2}>{item.titulo}</Text>

            <View style={styles.cardActions}>
                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => navigation.navigate('AdminEditActivity', { id: item.id })}
                >
                    <Pencil size={16} color={theme.colors.primary} />
                    <Text style={[styles.actionText, { color: theme.colors.primary }]}>Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => handleDelete(item)}
                >
                    <Trash2 size={16} color={theme.colors.error} />
                    <Text style={[styles.actionText, { color: theme.colors.error }]}>Eliminar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (isLoading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={activities}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                renderItem={renderItem}
                onRefresh={refetch}
                refreshing={false}
                ListEmptyComponent={
                    <EmptyState icon="🗓️" title="Sin actividades" subtitle="Crea la primera actividad." />
                }
            />

            {/* FAB */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('AdminCreateActivity')}
            >
                <Plus color="#fff" size={26} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: theme.spacing.lg, paddingBottom: 100 },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
        gap: theme.spacing.sm,
        ...theme.shadow.sm,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    catPill: {
        backgroundColor: theme.colors.primaryLight + '20',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: theme.borderRadius.full,
    },
    catText: { fontSize: 11, fontWeight: '700', color: theme.colors.primary, textTransform: 'uppercase' },
    dateText: { ...theme.typography.caption, color: theme.colors.textSecondary },
    titulo: { ...theme.typography.h4, color: theme.colors.text },
    cardActions: { flexDirection: 'row', gap: theme.spacing.lg, paddingTop: 4 },
    actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    actionText: { fontSize: 13, fontWeight: '600' },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...theme.shadow.md,
    },
});
