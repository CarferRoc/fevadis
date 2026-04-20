import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CheckSquare, Square, Users, Search } from 'lucide-react';
import { theme } from '../../theme';
import { useAuthStore } from '../../store/useAuthStore';
import { chatService } from '../../services/chatService';
import { usersService } from '../../services/usersService';
import { activitiesService } from '../../services/activitiesService';
import { registrationsService } from '../../services/registrationsService';
import type { Profile, Activity } from '../../types';
import { AdminHeader } from '../../components/AdminHeader';

export function AdminCreateGroupChatPage() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const qc = useQueryClient();

    const [groupName, setGroupName] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
    const [filterMode, setFilterMode] = useState<'all' | 'activity'>('all');
    const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);

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

    const [displayUsers, setDisplayUsers] = useState<Profile[]>([]);

    useEffect(() => {
        if (filterMode === 'all' && allUsers) {
            setDisplayUsers(allUsers.filter((u) => u.user_id !== user?.id));
        } else if (filterMode === 'activity' && activityRegistrations) {
            const enrolled = activityRegistrations
                .filter((r) => r.status === 'aceptado' || r.status === 'pendiente')
                .map((r) => r.profile as any)
                .filter((p) => p && p.user_id !== user?.id);
            const unique = Array.from(new Map(enrolled.map((x) => [x.user_id, x])).values());
            setDisplayUsers(unique);
        } else {
            setDisplayUsers([]);
        }
    }, [filterMode, allUsers, activityRegistrations, selectedActivityId, user?.id]);

    function toggleUser(userId: string) {
        const next = new Set(selectedUsers);
        if (next.has(userId)) next.delete(userId);
        else next.add(userId);
        setSelectedUsers(next);
    }

    function toggleSelectAll() {
        const isAllSelected = displayUsers.length > 0 && displayUsers.every((u) => selectedUsers.has(u.user_id));
        const next = new Set(selectedUsers);
        if (isAllSelected) displayUsers.forEach((u) => next.delete(u.user_id));
        else displayUsers.forEach((u) => next.add(u.user_id));
        setSelectedUsers(next);
    }

    const mutation = useMutation({
        mutationFn: async () => {
            if (!groupName.trim()) throw new Error('El nombre del grupo es obligatorio');
            if (selectedUsers.size === 0) throw new Error('Debes seleccionar al menos un participante');
            if (!user?.id) throw new Error('No estás autenticado');
            return chatService.createGroupChat(groupName.trim(), Array.from(selectedUsers), user.id);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin-groups'] });
            qc.invalidateQueries({ queryKey: ['chats'] });
            toast.success('Grupo creado');
            navigate(-1);
        },
        onError: (error: any) => toast.error('Error', { description: error.message || 'Error al crear el grupo' }),
    });

    const isAllSelected = displayUsers.length > 0 && displayUsers.every((u) => selectedUsers.has(u.user_id));
    const anyLoading = filterMode === 'all' ? loadingUsers : loadingRegistrations;

    return (
        <div style={{ flex: 1, backgroundColor: '#FAFAFA', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <AdminHeader title="Nuevo Grupo" back />

            <div style={{ backgroundColor: theme.colors.surface, padding: '16px 16px 12px', borderBottom: `1px solid ${theme.colors.border}`, boxShadow: '0 2px 6px rgba(26,36,22,0.05)' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: theme.colors.text, marginBottom: 4, letterSpacing: -0.4 }}>Crear Grupo de Chat</div>
                <div style={{ fontSize: 14, color: theme.colors.textSecondary }}>
                    Selecciona los integrantes para el nuevo grupo
                </div>
            </div>

            <div style={{ flex: 1, padding: 12, overflowY: 'auto' }}>
                <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 15, fontWeight: 700, color: theme.colors.text, marginBottom: 8, marginLeft: 4, display: 'block' }}>
                        Nombre del Grupo
                    </label>
                    <input
                        placeholder="Ej: Equipo Logística Evento X"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        maxLength={50}
                        style={{
                            width: '100%',
                            backgroundColor: theme.colors.surface,
                            border: '1.5px solid #E5E7EB',
                            borderRadius: 14,
                            padding: 16,
                            fontSize: 16,
                            color: theme.colors.text,
                            outline: 'none',
                            boxSizing: 'border-box',
                        }}
                    />
                </div>

                <div style={{ fontSize: 15, fontWeight: 700, color: theme.colors.text, marginBottom: 8, marginLeft: 4 }}>
                    Añadir Participantes
                </div>

                <div
                    style={{
                        display: 'flex',
                        backgroundColor: '#E5E7EB',
                        borderRadius: 14,
                        padding: 4,
                        marginBottom: 16,
                    }}
                >
                    {(['all', 'activity'] as const).map((mode) => {
                        const active = filterMode === mode;
                        return (
                            <button
                                key={mode}
                                onClick={() => setFilterMode(mode)}
                                style={{
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 8,
                                    padding: '12px 0',
                                    borderRadius: 10,
                                    border: 'none',
                                    backgroundColor: active ? theme.colors.surface : 'transparent',
                                    boxShadow: active ? '0 2px 6px rgba(26,36,22,0.05)' : 'none',
                                    color: active ? theme.colors.primary : theme.colors.textSecondary,
                                    cursor: 'pointer',
                                    fontSize: 14,
                                    fontWeight: 700,
                                }}
                            >
                                {mode === 'all' ? <Users size={18} /> : <Search size={18} />}
                                {mode === 'all' ? 'Directorio' : 'Por Actividad'}
                            </button>
                        );
                    })}
                </div>

                {filterMode === 'activity' && (
                    <div style={{ marginBottom: 16 }}>
                        {loadingActivities ? (
                            <div style={{ textAlign: 'center', padding: 10, color: theme.colors.textSecondary }}>Cargando…</div>
                        ) : (
                            <div className="hide-scrollbar" style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8 }}>
                                {activities?.map((act: Activity) => {
                                    const active = selectedActivityId === act.id;
                                    return (
                                        <button
                                            key={act.id}
                                            onClick={() => setSelectedActivityId(act.id)}
                                            style={{
                                                padding: '10px 20px',
                                                backgroundColor: active ? theme.colors.primary : theme.colors.surface,
                                                color: active ? '#fff' : theme.colors.textSecondary,
                                                borderRadius: 20,
                                                border: `1px solid ${active ? theme.colors.primary : '#E5E7EB'}`,
                                                fontSize: 14,
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                                whiteSpace: 'nowrap',
                                                flexShrink: 0,
                                                boxShadow: '0 2px 6px rgba(26,36,22,0.05)',
                                            }}
                                        >
                                            {act.titulo}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                        {!selectedActivityId && !loadingActivities && (
                            <div style={{ fontSize: 13, color: theme.colors.textTertiary, textAlign: 'center', marginTop: 10 }}>
                                Selecciona una actividad para cargar los asistentes matriculados.
                            </div>
                        )}
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, padding: '0 4px' }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: theme.colors.textSecondary }}>
                        Usuarios ({selectedUsers.size}/{displayUsers.length})
                    </div>
                    <button
                        onClick={toggleSelectAll}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                        }}
                    >
                        <span style={{ fontSize: 14, fontWeight: 700, color: theme.colors.primary }}>
                            {isAllSelected ? 'Desmarcar todos' : 'Marcar todos'}
                        </span>
                        {isAllSelected ? (
                            <CheckSquare size={18} color={theme.colors.primary} />
                        ) : (
                            <Square size={18} color={theme.colors.primary} />
                        )}
                    </button>
                </div>

                <div style={{ paddingBottom: 120 }}>
                    {anyLoading ? (
                        <div style={{ textAlign: 'center', padding: 40, color: theme.colors.textSecondary }}>Cargando…</div>
                    ) : displayUsers.length === 0 ? (
                        <div style={{ textAlign: 'center', marginTop: 60, opacity: 0.6 }}>
                            <Users size={48} color={theme.colors.border} style={{ marginBottom: 12 }} />
                            <div style={{ fontSize: 14, color: theme.colors.textSecondary }}>No hay usuarios para mostrar</div>
                        </div>
                    ) : (
                        displayUsers.map((u) => {
                            const selected = selectedUsers.has(u.user_id);
                            const initial = (u.nombre ? u.nombre.charAt(0) : 'U').toUpperCase();
                            return (
                                <div
                                    key={u.user_id}
                                    onClick={() => toggleUser(u.user_id)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        backgroundColor: selected ? theme.colors.primary + '0D' : theme.colors.surface,
                                        padding: 14,
                                        borderRadius: 16,
                                        marginBottom: 10,
                                        border: `1px solid ${selected ? theme.colors.primary + '80' : '#F3F4F6'}`,
                                        cursor: 'pointer',
                                        boxShadow: '0 2px 6px rgba(26,36,22,0.05)',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 44,
                                            height: 44,
                                            borderRadius: 22,
                                            backgroundColor: selected ? theme.colors.primary : '#F3F4F6',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            marginRight: 14,
                                            flexShrink: 0,
                                        }}
                                    >
                                        <span style={{ fontSize: 17, fontWeight: 700, color: selected ? '#fff' : theme.colors.textSecondary }}>{initial}</span>
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: theme.colors.text, marginBottom: 2 }}>
                                            {u.nombre} {u.apellidos}
                                        </div>
                                        <div style={{ fontSize: 13, color: theme.colors.textTertiary }}>
                                            {(u as any).dni || 'DNI no disponible'}
                                        </div>
                                    </div>
                                    <div style={{ paddingLeft: 10 }}>
                                        {selected ? (
                                            <CheckSquare size={20} color={theme.colors.primary} />
                                        ) : (
                                            <Square size={20} color={theme.colors.border} />
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <div
                style={{
                    backgroundColor: theme.colors.surface,
                    padding: 16,
                    paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
                    borderTop: '1px solid #F3F4F6',
                    boxShadow: '0 -4px 16px rgba(26,36,22,0.08)',
                }}
            >
                <button
                    onClick={() => mutation.mutate()}
                    disabled={!groupName.trim() || selectedUsers.size === 0 || mutation.isPending}
                    style={{
                        width: '100%',
                        backgroundColor: !groupName.trim() || selectedUsers.size === 0 ? theme.colors.textTertiary : theme.colors.primary,
                        opacity: !groupName.trim() || selectedUsers.size === 0 ? 0.7 : 1,
                        color: '#fff',
                        padding: '16px 0',
                        borderRadius: 14,
                        border: 'none',
                        fontSize: 16,
                        fontWeight: 700,
                        cursor: groupName.trim() && selectedUsers.size > 0 && !mutation.isPending ? 'pointer' : 'not-allowed',
                    }}
                >
                    {mutation.isPending ? 'Creando…' : 'Confirmar Creación de Grupo'}
                </button>
            </div>
        </div>
    );
}
