import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Alert,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { registrationsService } from '../../services/registrationsService';
import { documentService } from '../../services/documentService';
import { useAuthStore } from '../../store/useAuthStore';
import { StatusBadge, AttendanceBadge } from '../../components/StatusBadge';
import { theme } from '../../theme';
import { Registration, RegistrationStatus, AttendanceStatus } from '../../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { EmptyState } from '../../components/EmptyState';
import { Button } from '../../components/Button';

type FilterType = 'todas' | 'pendiente' | 'aceptado';

export default function AdminRegistrationsScreen() {
    const { user } = useAuthStore();
    const [filter, setFilter] = useState<FilterType>('pendiente');

    const { data: registrations, refetch, isLoading, error } = useQuery({
        queryKey: ['admin-registrations'],
        queryFn: registrationsService.getAllRegistrations,
        retry: false,
    });

    // Debug
    React.useEffect(() => {
        console.log('[AdminReg] data:', JSON.stringify(registrations));
        console.log('[AdminReg] error:', JSON.stringify(error));
    }, [registrations, error]);

    const filtered = (registrations ?? []).filter((r) => {
        if (filter === 'todas') return true;
        return r.status === filter;
    });

    async function updateStatus(reg: Registration, status: RegistrationStatus) {
        if (!user) return;

        if (status === 'aceptado') {
            const nombre = `${reg.profile?.nombre ?? ''} ${reg.profile?.apellidos ?? ''}`.trim();
            Alert.alert(
                '¿Confirmar inscripción?',
                `¿Seguro que quieres que ${nombre || 'esta persona'} asista al evento "${reg.activity?.titulo ?? ''}"?`,
                [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                        text: 'Sí, aceptar',
                        style: 'default',
                        onPress: async () => {
                            try {
                                await registrationsService.updateStatus(reg.id, status, user.id);
                                refetch();
                            } catch (e: any) {
                                Alert.alert('Error', e.message);
                            }
                        },
                    },
                ]
            );
            return;
        }

        try {
            await registrationsService.updateStatus(reg.id, status, user.id);
            refetch();
        } catch (e: any) {
            Alert.alert('Error', e.message);
        }
    }

    async function markAttendance(reg: Registration, attendance: AttendanceStatus) {
        if (!user) return;

        if (attendance === 'asistio') {
            Alert.alert(
                'Marcar asistencia',
                '¿Deseas subir el certificado de voluntariado para este asistente?',
                [
                    {
                        text: 'Sin certificado',
                        onPress: async () => {
                            try {
                                await registrationsService.markAttendance(reg.id, attendance, user.id);
                                refetch();
                            } catch (e: any) {
                                Alert.alert('Error', e.message);
                            }
                        },
                    },
                    {
                        text: 'Subir certificado',
                        style: 'default',
                        onPress: async () => {
                            try {
                                await registrationsService.markAttendance(reg.id, attendance, user.id);
                                await documentService.pickAndUploadCertificate(
                                    reg.id,
                                    reg.activity_id,
                                    reg.user_id,
                                    user.id
                                );
                                refetch();
                                Alert.alert('✅ Certificado subido', 'Asistencia marcada y certificado guardado.');
                            } catch (e: any) {
                                if (e.message !== 'No se seleccionó ningún archivo') {
                                    Alert.alert('Error', e.message);
                                }
                            }
                        },
                    },
                ]
            );
            return;
        }

        try {
            await registrationsService.markAttendance(reg.id, attendance, user.id);
            refetch();
        } catch (e: any) {
            Alert.alert('Error', e.message);
        }
    }

    const renderItem = ({ item }: { item: Registration }) => (
        <View style={styles.card}>
            <Text style={styles.activityName} numberOfLines={1}>
                {item.activity?.titulo ?? 'Actividad'}
            </Text>

            <View style={styles.userRow}>
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>
                        {item.profile?.nombre} {item.profile?.apellidos}
                    </Text>
                    <Text style={styles.userDni}>{item.profile?.dni}</Text>
                </View>
                <StatusBadge status={item.status} />
            </View>

            {item.activity?.fecha_inicio && (
                <Text style={styles.date}>
                    {format(new Date(item.activity.fecha_inicio), "d MMM yyyy", { locale: es })}
                </Text>
            )}

            {/* Actions */}
            {item.status === 'pendiente' && (
                <View style={styles.actions}>
                    <Button
                        title="Aceptar"
                        variant="secondary"
                        size="sm"
                        onPress={() => updateStatus(item, 'aceptado')}
                        style={{ flex: 1 }}
                    />
                    <Button
                        title="Rechazar"
                        variant="danger"
                        size="sm"
                        onPress={() => updateStatus(item, 'rechazado')}
                        style={{ flex: 1 }}
                    />
                </View>
            )}

            {item.status === 'aceptado' && (
                <View style={styles.attendanceSection}>
                    <View style={styles.attendanceHeader}>
                        <Text style={styles.attendanceLabel}>Asistencia:</Text>
                        <AttendanceBadge attendance={item.attendance} />
                    </View>
                    <View style={styles.actions}>
                        <Button
                            title="Asistió ✓"
                            variant={item.attendance === 'asistio' ? 'secondary' : 'outline'}
                            size="sm"
                            onPress={() => markAttendance(item, 'asistio')}
                            style={{ flex: 1 }}
                        />
                        <Button
                            title="No asistió"
                            variant={item.attendance === 'no_asistio' ? 'danger' : 'outline'}
                            size="sm"
                            onPress={() => markAttendance(item, 'no_asistio')}
                            style={{ flex: 1 }}
                        />
                    </View>
                </View>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Error banner */}
            {error && (
                <View style={styles.errorBanner}>
                    <Text style={styles.errorText}>
                        Error: {(error as any)?.message ?? JSON.stringify(error)}
                    </Text>
                </View>
            )}

            {/* Filter tabs */}
            <View style={styles.filterRow}>
                {(['pendiente', 'aceptado', 'todas'] as FilterType[]).map((f) => (
                    <TouchableOpacity
                        key={f}
                        style={[styles.filterTab, filter === f && styles.filterTabActive]}
                        onPress={() => setFilter(f)}
                    >
                        <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <FlatList
                data={filtered}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                onRefresh={refetch}
                refreshing={isLoading}
                ListEmptyComponent={
                    <EmptyState
                        icon="📋"
                        title={error ? 'Error cargando' : 'Sin inscripciones'}
                        subtitle={
                            error
                                ? (error as any)?.message ?? 'Error desconocido'
                                : `No hay inscripciones en estado "${filter}"`
                        }
                    />
                }
            />

        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    errorBanner: {
        backgroundColor: theme.colors.error,
        padding: theme.spacing.md,
    },
    errorText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
    filterRow: {
        flexDirection: 'row',
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    filterTab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
    },
    filterTabActive: {
        borderBottomWidth: 2,
        borderBottomColor: theme.colors.primary,
    },
    filterTabText: { ...theme.typography.bodySmall, fontWeight: '600', color: theme.colors.textSecondary },
    filterTabTextActive: { color: theme.colors.primary },
    list: { padding: theme.spacing.lg },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
        gap: theme.spacing.sm,
        ...theme.shadow.sm,
    },
    activityName: { ...theme.typography.h4, color: theme.colors.primary, marginBottom: 4 },
    userRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    userInfo: { flex: 1 },
    userName: { ...theme.typography.h4, color: theme.colors.text },
    userDni: { ...theme.typography.caption, color: theme.colors.textSecondary },
    date: { ...theme.typography.caption, color: theme.colors.textSecondary },
    actions: { flexDirection: 'row', gap: theme.spacing.sm, marginTop: 4 },
    attendanceSection: { gap: theme.spacing.sm, paddingTop: theme.spacing.sm, borderTopWidth: 1, borderTopColor: theme.colors.border },
    attendanceHeader: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
    attendanceLabel: { ...theme.typography.label, color: theme.colors.textSecondary },
});
