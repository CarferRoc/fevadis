import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Alert,
    TouchableOpacity,
    Modal,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { adminService } from '../../services/adminService';
import { useAuthStore } from '../../store/useAuthStore';
import { RoleBadge } from '../../components/RoleBadge';
import { EmptyState } from '../../components/EmptyState';
import { Button } from '../../components/Button';
import { theme } from '../../theme';
import { Profile, UserRole } from '../../types';

const ROLES: UserRole[] = ['admin', 'editor', 'voluntario'];

export default function AdminUsersScreen() {
    const { user: currentUser } = useAuthStore();
    const navigation = useNavigation();
    const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const { data: users, refetch, isLoading } = useQuery({
        queryKey: ['admin-users'],
        queryFn: adminService.getUsers,
    });

    function openRoleModal(profile: Profile) {
        setSelectedUser(profile);
        setModalVisible(true);
    }

    async function handleChangeRole(newRole: UserRole) {
        if (!selectedUser) return;
        setModalVisible(false);

        try {
            await adminService.changeRole(selectedUser.user_id, newRole);
            Alert.alert('✅ Rol actualizado', `${selectedUser.nombre} ahora es ${newRole}.`);
            refetch();
        } catch (e: any) {
            Alert.alert('Error', e.message);
        }
    }

    const renderItem = ({ item }: { item: Profile }) => {
        const isMe = item.user_id === currentUser?.id;
        const fullName = `${item.nombre} ${item.apellidos}`.trim();
        return (
            <View style={styles.card}>
                <View style={styles.cardRow}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {item.nombre?.[0]}{item.apellidos?.[0]}
                        </Text>
                    </View>
                    <View style={styles.info}>
                        <Text style={styles.name}>
                            {fullName}
                            {isMe && <Text style={styles.meTag}> (tú)</Text>}
                        </Text>
                        <Text style={styles.dni}>{item.dni}</Text>
                        <RoleBadge role={item.role} size="sm" />
                    </View>
                </View>
                <View style={styles.btnRow}>
                    <Button
                        title="📁 Ver archivos"
                        variant="outline"
                        size="sm"
                        onPress={() =>
                            (navigation as any).navigate('AdminUserDocuments', {
                                userId: item.user_id,
                                userName: fullName,
                            })
                        }
                        style={{ flex: 1 }}
                    />
                    {!isMe && (
                        <Button
                            title="Cambiar rol"
                            variant="outline"
                            size="sm"
                            onPress={() => openRoleModal(item)}
                            style={{ flex: 1 }}
                        />
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={users}
                keyExtractor={(item) => item.user_id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                onRefresh={refetch}
                refreshing={isLoading}
                ListEmptyComponent={
                    <EmptyState icon="👥" title="Sin usuarios" subtitle="No hay usuarios registrados aún." />
                }
            />

            {/* Role change modal */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setModalVisible(false)}
                >
                    <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
                        <Text style={styles.modalTitle}>
                            Cambiar rol de {selectedUser?.nombre}
                        </Text>
                        <Text style={styles.modalSub}>Rol actual: {selectedUser?.role}</Text>
                        {ROLES.map((role) => (
                            <TouchableOpacity
                                key={role}
                                style={[
                                    styles.roleOption,
                                    selectedUser?.role === role && styles.roleOptionActive,
                                ]}
                                onPress={() => handleChangeRole(role)}
                            >
                                <RoleBadge role={role} />
                                {selectedUser?.role === role && (
                                    <Text style={styles.currentLabel}>Actual</Text>
                                )}
                            </TouchableOpacity>
                        ))}
                        <Button
                            title="Cancelar"
                            variant="ghost"
                            onPress={() => setModalVisible(false)}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    list: { padding: theme.spacing.lg },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
        gap: theme.spacing.sm,
        ...theme.shadow.sm,
    },
    cardRow: { flexDirection: 'row', gap: theme.spacing.md, alignItems: 'center' },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: theme.colors.primaryLight + '30',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: { fontSize: 18, fontWeight: '700', color: theme.colors.primary },
    info: { flex: 1, gap: 4 },
    name: { ...theme.typography.h4, color: theme.colors.text },
    meTag: { ...theme.typography.caption, color: theme.colors.textSecondary },
    dni: { ...theme.typography.bodySmall, color: theme.colors.textSecondary },
    roleBtn: { alignSelf: 'flex-start' },
    btnRow: { flexDirection: 'row', gap: 8 },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalSheet: {
        backgroundColor: theme.colors.surface,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: theme.spacing.xl,
        gap: theme.spacing.md,
    },
    modalTitle: { ...theme.typography.h3, color: theme.colors.text },
    modalSub: { ...theme.typography.bodySmall, color: theme.colors.textSecondary },
    roleOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.colors.background,
    },
    roleOptionActive: { borderWidth: 1.5, borderColor: theme.colors.primary },
    currentLabel: { ...theme.typography.caption, color: theme.colors.primary, fontWeight: '600' },
});
