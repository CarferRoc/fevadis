import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Send, Settings, ChevronLeft } from 'lucide-react';
import { chatService } from '../../services/chatService';
import { useAuthStore } from '../../store/useAuthStore';
import type { Message, Chat } from '../../types';
import { theme } from '../../theme';

const NAME_COLORS = ['#3E7CB1', '#D48712', '#7A52B4', '#D64C8A', '#558A2D', '#3E7A1A', '#A62F2F', '#4E4696'];

function colorForId(id: string) {
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = (hash << 5) - hash + id.charCodeAt(i);
    return NAME_COLORS[Math.abs(hash) % NAME_COLORS.length];
}

export function ChatPage() {
    const { chatId } = useParams<{ chatId: string }>();
    const navigate = useNavigate();
    const [search] = useSearchParams();
    const { user, profile } = useAuthStore();

    const paramsIsGroup = search.get('isGroup') === '1';
    const paramsOtherName = search.get('otherUserName') ?? 'Chat';
    const paramsIsAdmin = search.get('isAdmin') === '1';
    const paramsOnlyAdmins = search.get('onlyAdmins') === '1';

    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);
    const [liveMessages, setLiveMessages] = useState<Message[]>([]);
    const listRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const { data: initialMessages } = useQuery({
        queryKey: ['messages', chatId],
        queryFn: () => chatService.getMessages(chatId!),
        enabled: !!chatId,
    });

    const { data: chatDetails } = useQuery({
        queryKey: ['chat-detail', chatId, user?.id],
        queryFn: async () => {
            const data = await chatService.getChats(user?.id || '');
            return data.find((c: Chat) => c.id === chatId);
        },
        enabled: !!chatId && !!user,
    });

    const isGroup = chatDetails ? chatDetails.is_group : paramsIsGroup;
    const groupOnlyAdmins = chatDetails ? chatDetails.only_admins_can_speak : paramsOnlyAdmins;
    const isAdmin = paramsIsAdmin || profile?.role === 'admin' || profile?.role === 'editor';

    const { data: profiles } = useQuery({
        queryKey: ['chat-participants', chatId],
        queryFn: () => chatService.getChatParticipants(chatId!),
        enabled: !!chatId,
    });

    const profileMap = useMemo(() => {
        const map = new Map<string, { nombre: string; apellidos: string; role: string }>();
        profiles?.forEach((p) => map.set(p.user_id, p));
        return map;
    }, [profiles]);

    const allMessages = useMemo(
        () => [
            ...(initialMessages ?? []),
            ...liveMessages.filter((m) => !initialMessages?.find((im) => im.id === m.id)),
        ],
        [initialMessages, liveMessages]
    );

    useEffect(() => {
        if (!chatId) return;
        const channel = chatService.subscribeToMessages(chatId, (msg) => {
            setLiveMessages((prev) => [...prev, msg]);
        });
        return () => {
            channel.unsubscribe();
        };
    }, [chatId]);

    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [allMessages.length]);

    async function handleSend() {
        if (!text.trim() || !user || !chatId) return;
        setSending(true);
        try {
            await chatService.sendMessage(chatId, user.id, text);
            setText('');
            if (textareaRef.current) textareaRef.current.style.height = '40px';
        } catch (e) {
            console.error(e);
        } finally {
            setSending(false);
        }
    }

    function handleTextareaInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
        setText(e.target.value);
        const el = e.target;
        el.style.height = '40px';
        el.style.height = Math.min(el.scrollHeight, 120) + 'px';
    }

    const title = chatDetails?.is_group ? (chatDetails.name ?? 'Grupo') : paramsOtherName;

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: theme.colors.background, minHeight: 0 }}>
            {/* Header */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px 12px',
                    paddingTop: 'calc(env(safe-area-inset-top, 0px) + 10px)',
                    backgroundColor: theme.colors.primary,
                    color: '#fff',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    gap: 4,
                }}
            >
                <button
                    onClick={() => navigate(-1)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 6, color: '#fff', display: 'flex', alignItems: 'center' }}
                    aria-label="Volver"
                >
                    <ChevronLeft size={26} />
                </button>
                <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0, flex: 1, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {title}
                </h1>
                {isGroup && isAdmin && (
                    <button
                        onClick={() => navigate(`/chats/${chatId}/settings?initial=${groupOnlyAdmins ? '1' : '0'}`)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 6, color: '#fff' }}
                        aria-label="Ajustes del grupo"
                    >
                        <Settings size={22} />
                    </button>
                )}
            </div>

            {/* Messages */}
            <div
                ref={listRef}
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '14px 14px 10px',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {allMessages.map((item, index) => {
                    const isMe = item.sender_id === user?.id;
                    const prev = allMessages[index - 1];
                    const sameAuthor = prev && prev.sender_id === item.sender_id;
                    const p = profileMap.get(item.sender_id);
                    const senderName = p ? `${p.nombre} ${p.apellidos}`.trim() || 'Usuario' : 'Usuario';
                    const showSender = !isMe && !sameAuthor;
                    const showMe = isMe && !sameAuthor;

                    return (
                        <div
                            key={item.id}
                            style={{
                                marginTop: sameAuthor ? 2 : 10,
                                maxWidth: '82%',
                                alignSelf: isMe ? 'flex-end' : 'flex-start',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: isMe ? 'flex-end' : 'flex-start',
                            }}
                        >
                            {showSender && (
                                <div style={{ fontSize: 12, fontWeight: 700, marginLeft: 10, marginBottom: 3, color: colorForId(item.sender_id) }}>
                                    {senderName}
                                    {p?.role && p.role !== 'voluntario' ? (
                                        <span style={{ fontSize: 11, fontWeight: 600, color: theme.colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                                            {' · '}{p.role}
                                        </span>
                                    ) : null}
                                </div>
                            )}
                            {showMe && (
                                <div style={{ fontSize: 11, fontWeight: 700, color: theme.colors.textTertiary, marginRight: 10, marginBottom: 3 }}>
                                    Tú
                                </div>
                            )}
                            <div
                                style={{
                                    borderRadius: 16,
                                    padding: '8px 12px',
                                    backgroundColor: isMe ? theme.colors.primary : theme.colors.surface,
                                    border: isMe ? 'none' : `1px solid ${theme.colors.border}`,
                                    borderBottomRightRadius: isMe ? 6 : 16,
                                    borderBottomLeftRadius: isMe ? 16 : 6,
                                    borderTopRightRadius: sameAuthor && isMe ? 6 : 16,
                                    borderTopLeftRadius: sameAuthor && !isMe ? 6 : 16,
                                    color: isMe ? '#fff' : theme.colors.text,
                                    fontSize: 14,
                                    lineHeight: '20px',
                                    fontWeight: isMe ? 500 : 400,
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                }}
                            >
                                {item.text}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Input */}
            {isGroup && groupOnlyAdmins && !isAdmin ? (
                <div
                    style={{
                        padding: 14,
                        backgroundColor: theme.colors.surfaceMuted,
                        borderTop: `1px solid ${theme.colors.border}`,
                        textAlign: 'center',
                    }}
                >
                    <span style={{ fontSize: 13, color: theme.colors.textSecondary, fontStyle: 'italic' }}>
                        Solo los administradores pueden enviar mensajes en este grupo.
                    </span>
                </div>
            ) : (
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSend();
                    }}
                    style={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        gap: 8,
                        padding: '10px 12px',
                        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 10px)',
                        backgroundColor: theme.colors.surface,
                        borderTop: `1px solid ${theme.colors.border}`,
                    }}
                >
                    <textarea
                        ref={textareaRef}
                        value={text}
                        onChange={handleTextareaInput}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder="Escribe un mensaje..."
                        rows={1}
                        style={{
                            flex: 1,
                            backgroundColor: theme.colors.surfaceAlt,
                            borderRadius: theme.radius.lg,
                            padding: '9px 14px',
                            fontSize: 14,
                            color: theme.colors.text,
                            border: `1px solid ${theme.colors.border}`,
                            resize: 'none',
                            minHeight: 40,
                            maxHeight: 120,
                            outline: 'none',
                            fontFamily: 'inherit',
                            lineHeight: '22px',
                        }}
                    />
                    <button
                        type="submit"
                        disabled={!text.trim() || sending}
                        style={{
                            width: 38,
                            height: 38,
                            borderRadius: theme.radius.md,
                            backgroundColor: theme.colors.primary,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            border: 'none',
                            cursor: text.trim() && !sending ? 'pointer' : 'not-allowed',
                            opacity: text.trim() && !sending ? 1 : 0.4,
                            flexShrink: 0,
                        }}
                        aria-label="Enviar"
                    >
                        <Send size={18} color="#fff" />
                    </button>
                </form>
            )}
        </div>
    );
}
