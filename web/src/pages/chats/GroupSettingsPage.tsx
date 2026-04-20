import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Lock } from 'lucide-react';
import { Header } from '../../components/Header';
import { chatService } from '../../services/chatService';
import { theme } from '../../theme';

export function GroupSettingsPage() {
    const { chatId } = useParams<{ chatId: string }>();
    const [search] = useSearchParams();
    const queryClient = useQueryClient();
    const [onlyAdmins, setOnlyAdmins] = useState(search.get('initial') === '1');

    const mutation = useMutation({
        mutationFn: async (newValue: boolean) => {
            if (!chatId) throw new Error('Falta chatId');
            await chatService.updateGroupSettings(chatId, newValue);
            return newValue;
        },
        onSuccess: (newValue) => {
            queryClient.invalidateQueries({ queryKey: ['admin-groups'] });
            queryClient.invalidateQueries({ queryKey: ['chats'] });
            setOnlyAdmins(newValue);
        },
        onError: (err: any) => {
            toast.error('Error', { description: err.message || 'No se pudo guardar la configuración' });
            setOnlyAdmins(!onlyAdmins);
        },
    });

    function toggle() {
        const next = !onlyAdmins;
        setOnlyAdmins(next);
        mutation.mutate(next);
    }

    return (
        <div style={{ flex: 1, backgroundColor: theme.colors.background, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <Header title="Ajustes del Grupo" back />
            <div style={{ padding: 16 }}>
                <div
                    style={{
                        backgroundColor: theme.colors.surface,
                        borderRadius: 16,
                        padding: 24,
                        border: '1px solid #F3F4F6',
                        boxShadow: '0 2px 6px rgba(26,36,22,0.05)',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 24, gap: 16 }}>
                        <div
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: 24,
                                backgroundColor: theme.colors.primary + '15',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                flexShrink: 0,
                            }}
                        >
                            <Lock size={24} color={theme.colors.primary} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 17, fontWeight: 700, color: theme.colors.text, marginBottom: 4 }}>
                                Silenciar Voluntarios
                            </div>
                            <div style={{ fontSize: 13, color: theme.colors.textSecondary, lineHeight: '20px' }}>
                                Si activas esto, solo los Administradores y Editores podrán enviar mensajes en este grupo.
                            </div>
                        </div>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingTop: 20,
                            borderTop: '1px solid #F3F4F6',
                        }}
                    >
                        <span style={{ fontSize: 14, fontWeight: 600, color: theme.colors.text }}>Solo admins hablan</span>
                        {mutation.isPending ? (
                            <div
                                style={{
                                    width: 22,
                                    height: 22,
                                    border: `3px solid ${theme.colors.primaryLight}`,
                                    borderTopColor: theme.colors.primary,
                                    borderRadius: '50%',
                                    animation: 'fevadis-spin 0.8s linear infinite',
                                }}
                            />
                        ) : (
                            <button
                                onClick={toggle}
                                aria-label="toggle"
                                style={{
                                    width: 52,
                                    height: 30,
                                    borderRadius: 15,
                                    backgroundColor: onlyAdmins ? theme.colors.primary : '#d1d5db',
                                    border: 'none',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    transition: 'background-color 200ms',
                                    padding: 0,
                                }}
                            >
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: 2,
                                        left: onlyAdmins ? 24 : 2,
                                        width: 26,
                                        height: 26,
                                        borderRadius: 13,
                                        backgroundColor: '#fff',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                        transition: 'left 200ms',
                                    }}
                                />
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <style>{`@keyframes fevadis-spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
