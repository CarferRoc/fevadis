import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare, Users } from 'lucide-react';
import { chatService } from '../../services/chatService';
import { useAuthStore } from '../../store/useAuthStore';
import type { Chat } from '../../types';
import { theme } from '../../theme';
import { EmptyState } from '../../components/EmptyState';

export function ChatsListPage() {
    const { user, profile } = useAuthStore();
    const navigate = useNavigate();

    const { data: chats, isLoading } = useQuery({
        queryKey: ['chats', user?.id],
        queryFn: () => (user ? chatService.getChats(user.id) : []),
        enabled: !!user,
    });

    function openChat(chat: Chat) {
        const params = new URLSearchParams({
            otherUserName: chat.is_group ? (chat.name ?? 'Grupo') : 'Chat',
            isGroup: chat.is_group ? '1' : '0',
            isAdmin: profile?.role === 'admin' || profile?.role === 'editor' ? '1' : '0',
            onlyAdmins: chat.only_admins_can_speak ? '1' : '0',
        });
        navigate(`/chats/${chat.id}?${params.toString()}`);
    }

    return (
        <div style={{ flex: 1, backgroundColor: theme.colors.background, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <div style={{ padding: '10px 18px 14px', paddingTop: 'calc(env(safe-area-inset-top, 0px) + 10px)' }}>
                <div style={{ fontSize: 30, fontWeight: 800, color: theme.colors.text, letterSpacing: -0.6, lineHeight: '36px' }}>
                    Chats
                </div>
                <div style={{ fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 }}>
                    Tus conversaciones y grupos
                </div>
            </div>

            {isLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
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
                    <style>{`@keyframes fevadis-spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            ) : chats && chats.length > 0 ? (
                <div style={{ padding: '6px 12px' }}>
                    {chats.map((c, idx) => (
                        <div key={c.id}>
                            <div
                                onClick={() => openChat(c)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    padding: '12px 10px',
                                    borderRadius: theme.radius.lg,
                                    cursor: 'pointer',
                                    transition: 'background-color 120ms',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.colors.primarySoft)}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                            >
                                <div
                                    style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 14,
                                        backgroundColor: c.is_group ? theme.colors.primaryLight : theme.colors.primarySoft,
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        flexShrink: 0,
                                    }}
                                >
                                    {c.is_group ? (
                                        <Users size={18} color={theme.colors.primaryDark} strokeWidth={2.2} />
                                    ) : (
                                        <MessageSquare size={18} color={theme.colors.primaryDark} strokeWidth={2.2} />
                                    )}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div
                                        style={{
                                            fontSize: 14,
                                            fontWeight: 600,
                                            color: theme.colors.text,
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}
                                    >
                                        {c.is_group ? c.name : `Chat #${c.id.substring(0, 8)}`}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 13,
                                            color: theme.colors.textSecondary,
                                            marginTop: 2,
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}
                                    >
                                        {c.last_message ?? 'Sin mensajes aún'}
                                    </div>
                                </div>
                            </div>
                            {idx < chats.length - 1 && (
                                <div style={{ height: 1, backgroundColor: theme.colors.border, marginLeft: 66 }} />
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <EmptyState
                    icon="💬"
                    title="Sin chats"
                    subtitle="Aquí aparecerán tus conversaciones cuando te añadan."
                />
            )}
        </div>
    );
}
