import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Alert,
    TouchableOpacity,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import { useAuthStore } from '../../store/useAuthStore';
import { FormInput } from '../../components/FormInput';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { theme } from '../../theme';
import { AuthorizedDni } from '../../types';
import { getDniError, formatDni } from '../../utils/dniValidator';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus, X, CheckCircle } from 'lucide-react-native';

const STATUS_COLORS: Record<AuthorizedDni['status'], { bg: string; text: string }> = {
    activo: { bg: '#ECFDF5', text: '#065F46' },
    usado: { bg: '#F3F4F6', text: '#374151' },
    revocado: { bg: '#FEE2E2', text: '#991B1B' },
};

export default function AdminAuthorizedDnisScreen() {
    const { user } = useAuthStore();
    const [newDni, setNewDni] = useState('');
    const [dniError, setDniError] = useState('');
    const [adding, setAdding] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const { data: dnis, refetch, isLoading } = useQuery({
        queryKey: ['authorized-dnis'],
        queryFn: adminService.getAuthorizedDnis,
    });

    async function handleAdd() {
        const err = getDniError(newDni);
        if (err) {
            setDniError(err);
            return;
        }

        setAdding(true);
        try {
            await adminService.addAuthorizedDni(formatDni(newDni), user!.id);
            setNewDni('');
            setShowForm(false);
            refetch();
        } catch (e: any) {
            Alert.alert('Error', e.message);
        } finally {
            setAdding(false);
        }
    }

    async function handleRevoke(item: AuthorizedDni) {
        Alert.alert(
            'Revocar DNI',
            `¿Revocar el DNI ${item.dni}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Revocar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await adminService.revokeAuthorizedDni(item.id);
                            refetch();
                        } catch (e: any) {
                            Alert.alert('Error', e.message);
                        }
                    },
                },
            ]
        );
    }

    const renderItem = ({ item }: { item: AuthorizedDni }) => {
        const statusCfg = STATUS_COLORS[item.status];
        return (
            <View style={styles.card}>
                <View style={styles.cardRow}>
                    <View>
                        <Text style={styles.dni}>{item.dni}</Text>
                        <Text style={styles.date}>
                            Alta: {format(new Date(item.created_at), "d MMM yyyy", { locale: es })}
                        </Text>
                        {item.used_at && (
                            <Text style={styles.date}>
                                Usado: {format(new Date(item.used_at), "d MMM yyyy", { locale: es })}
                            </Text>
                        )}
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
                        <Text style={[styles.statusText, { color: statusCfg.text }]}>
                            {item.status.toUpperCase()}
                        </Text>
                    </View>
                </View>

                {item.status === 'activo' && (
                    <Button
                        title="Revocar"
                        variant="danger"
                        size="sm"
                        onPress={() => handleRevoke(item)}
                        style={{ alignSelf: 'flex-start' }}
                    />
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Add form */}
            {showForm ? (
                <View style={styles.addForm}>
                    <FormInput
                        label="Nuevo DNI a autorizar"
                        placeholder="00000000A"
                        value={newDni}
                        onChangeText={(v) => {
                            setNewDni(v);
                            if (dniError) setDniError('');
                        }}
                        autoCapitalize="characters"
                        maxLength={9}
                        error={dniError}
                    />
                    <View style={styles.formActions}>
                        <Button
                            title="Añadir"
                            onPress={handleAdd}
                            loading={adding}
                            style={{ flex: 1 }}
                        />
                        <Button
                            title="Cancelar"
                            variant="outline"
                            onPress={() => setShowForm(false)}
                            style={{ flex: 1 }}
                        />
                    </View>
                </View>
            ) : (
                <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => setShowForm(true)}
                >
                    <Plus size={18} color={theme.colors.primary} />
                    <Text style={styles.addBtnText}>Añadir DNI autorizado</Text>
                </TouchableOpacity>
            )}

            <FlatList
                data={dnis}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                onRefresh={refetch}
                refreshing={isLoading}
                ListEmptyComponent={
                    <EmptyState
                        icon="🪪"
                        title="Sin DNIs autorizados"
                        subtitle="Añade DNIs para que puedan registrarse."
                    />
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    addForm: {
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.lg,
        gap: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    formActions: { flexDirection: 'row', gap: theme.spacing.sm },
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    addBtnText: { ...theme.typography.body, color: theme.colors.primary, fontWeight: '600' },
    list: { padding: theme.spacing.lg },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
        gap: theme.spacing.sm,
        ...theme.shadow.sm,
    },
    cardRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    dni: { ...theme.typography.h4, color: theme.colors.text, letterSpacing: 1 },
    date: { ...theme.typography.caption, color: theme.colors.textSecondary, marginTop: 2 },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: theme.borderRadius.full,
    },
    statusText: { fontSize: 11, fontWeight: '700' },
});
