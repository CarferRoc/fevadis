import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    Alert,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../types/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckSquare, Square, Users, Search } from 'lucide-react-native';

import { theme } from '../../theme';
import { Button } from '../../components/Button';
import { useAuthStore } from '../../store/useAuthStore';
import { chatService } from '../../services/chatService';
import { usersService, Profile } from '../../services/usersService';
import { activitiesService } from '../../services/activitiesService';
import { registrationsService } from '../../services/registrationsService';
import { Activity } from '../../types';

type Nav = NativeStackNavigationProp<AdminStackParamList, 'AdminCreateGroupChat'>;

export default function AdminCreateGroupChatScreen() {
    const navigation = useNavigation<Nav>();
    const { user } = useAuthStore();
    const queryClient = useQueryClient();

    const [groupName, setGroupName] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
    const [filterMode, setFilterMode] = useState<'all' | 'activity'>('all');
    const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);

    // Queries
    const { data: allUsers, isLoading: loadingUsers } = useQuery({
        queryKey: ['profiles-all'],
        queryFn: usersService.getUsers,
    });

    const { data: activities, isLoading: loadingActivities } = useQuery({
        queryKey: ['activities-all'],
        queryFn: () => activitiesService.getActivities('Todas'),
    });

    const { data: activityRegistrations, isLoading: loadingRegistrations } = useQuery({
        queryKey: ['registrations', selectedActivityId],
        queryFn: () => registrationsService.getRegistrationsForActivity(selectedActivityId!),
        enabled: !!selectedActivityId && filterMode === 'activity',
    });

    // Derive display users based on filter
    const [displayUsers, setDisplayUsers] = useState<Profile[]>([]);

    useEffect(() => {
        if (filterMode === 'all' && allUsers) {
            setDisplayUsers(allUsers.filter(u => u.user_id !== user?.id));
        } else if (filterMode === 'activity' && activityRegistrations) {
            // Get users enrolled in the activity (status = aceptado)
            const enrolled = activityRegistrations
                .filter(r => r.status === 'aceptado' || r.status === 'pendiente')
                .map(r => r.profile as any)
                .filter(p => p && p.user_id !== user?.id);

            // Remove duplicates just in case
            const unique = Array.from(new Map(enrolled.map(item => [item.user_id, item])).values());
            setDisplayUsers(unique);
        } else {
            setDisplayUsers([]);
        }
    }, [filterMode, allUsers, activityRegistrations, selectedActivityId, user?.id]);

    const toggleUser = (userId: string) => {
        const next = new Set(selectedUsers);
        if (next.has(userId)) {
            next.delete(userId);
        } else {
            next.add(userId);
        }
        setSelectedUsers(next);
    };

    const toggleSelectAll = () => {
        if (selectedUsers.size === displayUsers.length && displayUsers.length > 0) {
            // Deselect all displayed
            const next = new Set(selectedUsers);
            displayUsers.forEach(u => next.delete(u.user_id));
            setSelectedUsers(next);
        } else {
            // Select all displayed
            const next = new Set(selectedUsers);
            displayUsers.forEach(u => next.add(u.user_id));
            setSelectedUsers(next);
        }
    };

    const mutation = useMutation({
        mutationFn: async () => {
            if (!groupName.trim()) throw new Error('El nombre del grupo es obligatorio');
            if (selectedUsers.size === 0) throw new Error('Debes seleccionar al menos un participante');
            if (!user?.id) throw new Error('No estás autenticado');

            const participants = Array.from(selectedUsers);
            return chatService.createGroupChat(groupName.trim(), participants, user.id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-groups'] });
            queryClient.invalidateQueries({ queryKey: ['chats'] });
            Alert.alert('Éxito', 'Grupo de chat creado correctamente');
            navigation.goBack();
        },
        onError: (error: any) => {
            Alert.alert('Error', error.message || 'Error al crear el grupo de chat');
        },
    });

    const handleCreate = () => {
        mutation.mutate();
    };

    const isAllSelected = displayUsers.length > 0 && selectedUsers.size >= displayUsers.length && displayUsers.every(u => selectedUsers.has(u.user_id));

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            {/* Header Rediseñado */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Crear Grupo de Chat</Text>
                <Text style={styles.headerSubtitle}>Selecciona los integrantes para el nuevo grupo</Text>
            </View>

            <View style={styles.content}>
                {/* Nombre del Grupo */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Nombre del Grupo</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ej: Equipo Logística Evento X"
                        placeholderTextColor={theme.colors.textTertiary}
                        value={groupName}
                        onChangeText={setGroupName}
                        maxLength={50}
                    />
                </View>

                {/* Filtros Modernos */}
                <Text style={styles.label}>Añadir Participantes</Text>
                <View style={styles.segmentControl}>
                    <TouchableOpacity
                        style={[styles.segmentBtn, filterMode === 'all' && styles.segmentBtnActive]}
                        onPress={() => setFilterMode('all')}
                        activeOpacity={0.8}
                    >
                        <Users size={18} color={filterMode === 'all' ? theme.colors.primary : theme.colors.textSecondary} />
                        <Text style={[styles.segmentText, filterMode === 'all' && styles.segmentTextActive]}>
                            Directorio
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.segmentBtn, filterMode === 'activity' && styles.segmentBtnActive]}
                        onPress={() => setFilterMode('activity')}
                        activeOpacity={0.8}
                    >
                        <Search size={18} color={filterMode === 'activity' ? theme.colors.primary : theme.colors.textSecondary} />
                        <Text style={[styles.segmentText, filterMode === 'activity' && styles.segmentTextActive]}>
                            Por Actividad
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Selector de Actividad Ocultable con Animación/Transition */}
                {filterMode === 'activity' && (
                    <View style={styles.activityBox}>
                        {loadingActivities ? (
                            <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginVertical: 10 }} />
                        ) : (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollActivities}>
                                {activities?.map((act: Activity) => {
                                    const isActive = selectedActivityId === act.id;
                                    return (
                                        <TouchableOpacity
                                            key={act.id}
                                            style={[styles.pill, isActive && styles.pillActive]}
                                            onPress={() => setSelectedActivityId(act.id)}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                                                {act.titulo}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        )}
                        {!selectedActivityId && !loadingActivities && (
                            <Text style={styles.helperText}>Selecciona una actividad para cargar los asistentes matriculados.</Text>
                        )}
                    </View>
                )}

                {/* Selector de Usuarios */}
                <View style={styles.usersHeader}>
                    <Text style={styles.sectionTitle}>
                        Usuarios ({selectedUsers.size}/{displayUsers.length})
                    </Text>
                    <TouchableOpacity style={styles.selectAllBtn} onPress={toggleSelectAll}>
                        <Text style={styles.selectAllText}>
                            {isAllSelected ? 'Marcar todos' : 'Marcar todos'}
                        </Text>
                        {isAllSelected ? (
                            <CheckSquare size={18} color={theme.colors.primary} />
                        ) : (
                            <Square size={18} color={theme.colors.primary} />
                        )}
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.usersList} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                    {(filterMode === 'all' ? loadingUsers : loadingRegistrations) ? (
                        <ActivityIndicator style={{ marginTop: 40 }} size="large" color={theme.colors.primary} />
                    ) : displayUsers.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Users size={48} color={theme.colors.border} />
                            <Text style={styles.emptyText}>No hay usuarios para mostrar</Text>
                        </View>
                    ) : (
                        displayUsers.map(userItem => {
                            const isSelected = selectedUsers.has(userItem.user_id);
                            const initial = (userItem.nombre ? userItem.nombre.charAt(0) : 'U').toUpperCase();
                            return (
                                <TouchableOpacity
                                    key={userItem.user_id}
                                    style={[styles.userCard, isSelected && styles.userCardSelected]}
                                    onPress={() => toggleUser(userItem.user_id)}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.avatarBox, isSelected && { backgroundColor: theme.colors.primary }]}>
                                        <Text style={[styles.avatarText, isSelected && { color: '#fff' }]}>{initial}</Text>
                                    </View>
                                    <View style={styles.userInfo}>
                                        <Text style={styles.userName}>{userItem.nombre} {userItem.apellidos}</Text>
                                        <Text style={styles.userDni}>{(userItem as any).dni || 'DNI no disponible'}</Text>
                                    </View>
                                    <View style={styles.checkboxContainer}>
                                        {isSelected ? (
                                            <View style={styles.checkboxChecked}>
                                                <CheckSquare size={20} color={theme.colors.primary} />
                                            </View>
                                        ) : (
                                            <Square size={20} color={theme.colors.border} />
                                        )}
                                    </View>
                                </TouchableOpacity>
                            );
                        })
                    )}
                </ScrollView>
            </View>

            {/* Footer flotante */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.createBtn, (!groupName.trim() || selectedUsers.size === 0) && styles.createBtnDisabled]}
                    onPress={handleCreate}
                    disabled={!groupName.trim() || selectedUsers.size === 0 || mutation.isPending}
                    activeOpacity={0.8}
                >
                    {mutation.isPending ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.createBtnText}>Confirmar Creación de Grupo</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFAFA' },
    header: {
        backgroundColor: theme.colors.surface,
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.xl,
        paddingBottom: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        ...theme.shadow.sm,
    },
    headerTitle: { ...theme.typography.h1, color: theme.colors.text, marginBottom: 4 },
    headerSubtitle: { ...theme.typography.body, color: theme.colors.textSecondary },
    content: { flex: 1, padding: theme.spacing.md },
    inputContainer: { marginBottom: theme.spacing.xl },
    label: { ...theme.typography.h4, color: theme.colors.text, marginBottom: 8, marginLeft: 4 },
    input: {
        backgroundColor: theme.colors.surface,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        borderRadius: 14,
        padding: 16,
        fontSize: 16,
        color: theme.colors.text,
        ...theme.shadow.sm,
    },
    segmentControl: {
        flexDirection: 'row',
        backgroundColor: '#E5E7EB',
        borderRadius: 14,
        padding: 4,
        marginBottom: theme.spacing.lg,
    },
    segmentBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: 10,
    },
    segmentBtnActive: {
        backgroundColor: theme.colors.surface,
        ...theme.shadow.sm,
    },
    segmentText: { ...theme.typography.h4, fontSize: 14, color: theme.colors.textSecondary },
    segmentTextActive: { color: theme.colors.primary },
    activityBox: { marginBottom: theme.spacing.xl },
    scrollActivities: { paddingHorizontal: 4, paddingBottom: 8, gap: 10 },
    pill: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: theme.colors.surface,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        ...theme.shadow.sm,
    },
    pillActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    pillText: { ...theme.typography.button, color: theme.colors.textSecondary },
    pillTextActive: { color: '#fff' },
    helperText: { ...theme.typography.bodySmall, color: theme.colors.textTertiary, textAlign: 'center', marginTop: 10 },
    usersHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        paddingHorizontal: 4,
    },
    sectionTitle: { ...theme.typography.h4, color: theme.colors.textSecondary },
    selectAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    selectAllText: { ...theme.typography.button, color: theme.colors.primary },
    usersList: { flex: 1 },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 60, opacity: 0.6 },
    emptyText: { ...theme.typography.body, color: theme.colors.textSecondary, marginTop: 12 },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        padding: 14,
        borderRadius: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        ...theme.shadow.sm,
    },
    userCardSelected: {
        borderColor: theme.colors.primary + '50',
        backgroundColor: theme.colors.primary + '05',
    },
    avatarBox: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    avatarText: { ...theme.typography.h3, color: theme.colors.textSecondary },
    userInfo: { flex: 1 },
    userName: { ...theme.typography.body, fontWeight: '700', color: theme.colors.text, marginBottom: 2 },
    userDni: { ...theme.typography.bodySmall, color: theme.colors.textTertiary },
    checkboxContainer: { paddingLeft: 10 },
    checkboxChecked: {
        backgroundColor: '#fff',
        borderRadius: 4,
    },
    footer: {
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.lg,
        paddingBottom: theme.spacing.xl,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        ...theme.shadow.md,
    },
    createBtn: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        ...theme.shadow.sm,
    },
    createBtnDisabled: {
        backgroundColor: theme.colors.textTertiary,
        opacity: 0.7,
    },
    createBtnText: { ...theme.typography.button, color: '#fff', fontSize: 16 },
});
