import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Trash2, Users } from 'lucide-react';
import { chatService } from '../../services/chatService';
import type { Chat } from '../../types';
import { EmptyState } from '../../components/EmptyState';
import { Button } from '../../components/Button';
import { AdminHeader } from '../../components/AdminHeader';
import { theme } from '../../theme';

export function AdminGroupChatsPage() {
    const navigate = useNavigate();
    const qc = useQueryClient();

    const { data: groups, isLoading } = useQuery({
        queryKey: ['admin-groups'],
        queryFn: chatService.getAdminGroupChats,
    });

    const deleteMutation = useMutation({
        mutationFn: chatService.deleteChat,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin-groups'] });
            qc.invalidateQueries({ queryKey: ['chats'] });
            toast.success('Grupo eliminado');
        },
        onError: (error: any) => toast.error('Error', { description: error.message }),
    });

    function handleDelete(id: string) {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este grupo de chat?\nSe borrarán todos los mensajes.')) return;
        deleteMutation.mutate(id);
    }

    function openChat(chat: Chat) {
        const params = new URLSearchParams({
            otherUserName: chat.name ?? 'Grupo',
            isGroup: '1',
            isAdmin: '1',
            onlyAdmins: chat.only_admins_can_speak ? '1' : '0',
        });
        navigate(`/chats/${chat.id}?${params.toString()}`);
    }

    return (
        <div style={{ flex: 1, backgroundColor: theme.colors.background, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <AdminHeader
                title="Chats Grupales"
                back
                right={
                    <Button
                        title="+ Nuevo"
                        size="sm"
                        onPress={() => navigate('/admin/group-chats/new')}
                        style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none' }}
                    />
                }
            />
            <div style={{ padding: 16, paddingBottom: 32 }}>
                {isLoading ? (
                    <div style={{ textAlign: 'center', color: theme.colors.textSecondary, padding: 24 }}>Cargando…</div>
                ) : groups && groups.length > 0 ? (
                    groups.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => openChat(item)}
                            style={{
                                backgroundColor: theme.colors.surface,
                                borderRadius: theme.radius.lg,
                                padding: 12,
                                marginBottom: 12,
                                borderLeft: `4px solid ${theme.colors.primary}`,
                                boxShadow: '0 2px 6px rgba(26,36,22,0.05)',
                                cursor: 'pointer',
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                                <div style={{ fontSize: 17, fontWeight: 700, color: theme.colors.text, flex: 1, marginRight: 8 }}>
                                    {item.name ?? 'Grupo sin nombre'}
                                </div>
                                <div
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        backgroundColor: theme.colors.accent + '33',
                                        padding: '4px 8px',
                                        borderRadius: 9999,
                                        gap: 6,
                                    }}
                                >
                                    <Users size={12} color={theme.colors.accent} />
                                    <span style={{ fontSize: 12, fontWeight: 700, color: theme.colors.accent }}>
                                        {item.participants.length} usuarios
                                    </span>
                                </div>
                            </div>
                            <div style={{ fontSize: 14, color: theme.colors.textSecondary, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {item.last_message || 'No hay mensajes todavía'}
                            </div>
                            <div style={{ display: 'flex', gap: 12, paddingTop: 8, borderTop: `1px solid ${theme.colors.border}`, justifyContent: 'flex-end' }}>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(item.id);
                                    }}
                                    style={{
                                        width: 36,
                                        height: 36,
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        borderRadius: theme.radius.md,
                                        backgroundColor: theme.colors.error + '1A',
                                        border: 'none',
                                        cursor: 'pointer',
                                    }}
                                    aria-label="Eliminar"
                                >
                                    <Trash2 size={16} color={theme.colors.error} />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <EmptyState icon="💬" title="Sin grupos" subtitle="Empieza creando un nuevo grupo de chat para organizarte." />
                )}
            </div>
        </div>
    );
}
