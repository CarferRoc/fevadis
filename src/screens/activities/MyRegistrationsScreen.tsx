import React from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/useAuthStore';
import { registrationsService } from '../../services/registrationsService';
import { StatusBadge, AttendanceBadge } from '../../components/StatusBadge';
import { EmptyState } from '../../components/EmptyState';
import { theme } from '../../theme';
import { Registration } from '../../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, MapPin } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MyRegistrationsScreen() {
    const { user } = useAuthStore();

    const { data, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['my-registrations', user?.id],
        queryFn: () =>
            user ? registrationsService.getMyRegistrations(user.id) : [],
        enabled: !!user,
    });

    const renderItem = ({ item }: { item: Registration }) => {
        const act = item.activity;
        const startDate = act?.fecha_inicio ? new Date(act.fecha_inicio) : null;

        return (
            <View style={styles.card}>
                <Text style={styles.activityTitle} numberOfLines={2}>
                    {act?.titulo ?? 'Actividad'}
                </Text>

                {startDate && (
                    <View style={styles.metaRow}>
                        <Calendar size={13} color={theme.colors.textSecondary} />
                        <Text style={styles.metaText}>
                            {format(startDate, "d MMM yyyy, HH:mm", { locale: es })}
                        </Text>
                    </View>
                )}

                {act?.ubicacion && (
                    <View style={styles.metaRow}>
                        <MapPin size={13} color={theme.colors.textSecondary} />
                        <Text style={styles.metaText}>{act.ubicacion}</Text>
                    </View>
                )}

                <View style={styles.badges}>
                    <StatusBadge status={item.status} />
                    {item.status === 'aceptado' && (
                        <AttendanceBadge attendance={item.attendance} />
                    )}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <FlatList
                data={data}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={refetch}
                        colors={[theme.colors.primary]}
                    />
                }
                ListEmptyComponent={
                    isLoading ? null : (
                        <EmptyState
                            icon="📝"
                            title="Sin inscripciones"
                            subtitle="Todavía no te has apuntado a ninguna actividad."
                        />
                    )
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    list: { padding: theme.spacing.lg },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
        padding: 14,
        marginBottom: 10,
        gap: 6,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    activityTitle: { ...theme.typography.h4, color: theme.colors.text },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    metaText: { ...theme.typography.bodySmall, color: theme.colors.textSecondary },
    badges: { flexDirection: 'row', gap: theme.spacing.sm, marginTop: 4, flexWrap: 'wrap' },
});
