import { useNavigate } from 'react-router-dom';
import { CalendarDays, ClipboardCheck, Users, IdCard, Award, Gift, MessagesSquare, ChevronRight, Shield, FileText } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { AdminHeader } from '../../components/AdminHeader';
import { theme } from '../../theme';

const CARDS = [
    { to: '/admin/activities', icon: CalendarDays, title: 'Actividades', subtitle: 'Crear, editar y eliminar', tint: theme.colors.catOcio, tintBg: theme.colors.catOcioSoft },
    { to: '/admin/registrations', icon: ClipboardCheck, title: 'Inscripciones', subtitle: 'Aceptar y marcar asistencia', tint: theme.colors.primaryDark, tintBg: theme.colors.primaryLight },
    { to: '/admin/users', icon: Users, title: 'Usuarios', subtitle: 'Ver y gestionar roles', tint: theme.colors.warning, tintBg: theme.colors.warningSoft },
    { to: '/admin/dnis', icon: IdCard, title: 'DNIs autorizados', subtitle: 'Alta, baja y revocación', tint: theme.colors.error, tintBg: theme.colors.errorSoft },
    { to: '/admin/certificates', icon: Award, title: 'Certificados', subtitle: 'Por actividad y asistente', tint: theme.colors.catFormaciones, tintBg: theme.colors.catFormacionesSoft },
    { to: '/admin/rewards', icon: Gift, title: 'Recompensas', subtitle: 'Gestión de catálogo', tint: theme.colors.catTalleres, tintBg: theme.colors.catTalleresSoft },
    { to: '/admin/group-chats', icon: MessagesSquare, title: 'Grupos de chat', subtitle: 'Comunicaciones masivas', tint: theme.colors.catCampamentos, tintBg: theme.colors.catCampamentosSoft },
    { to: '/admin/info', icon: FileText, title: 'Información', subtitle: 'Subir archivos para voluntarios', tint: theme.colors.primaryDark, tintBg: theme.colors.primaryLight },
];

export function AdminHomePage() {
    const { profile } = useAuthStore();
    const navigate = useNavigate();

    return (
        <div style={{ flex: 1, backgroundColor: theme.colors.background, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <AdminHeader title="Panel de Administración" back onBack={() => navigate('/profile')} />

            <div style={{ padding: 16, paddingBottom: 40 }}>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        backgroundColor: theme.colors.primary,
                        borderRadius: theme.radius.xl,
                        padding: 18,
                        marginBottom: 18,
                        boxShadow: '0 2px 6px rgba(26,36,22,0.1)',
                    }}
                >
                    <div
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            flexShrink: 0,
                        }}
                    >
                        <Shield size={18} color="#fff" strokeWidth={2.2} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>Panel de administración</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.85)', marginTop: 2, letterSpacing: 0.3 }}>
                            {profile?.nombre} · {profile?.role?.toUpperCase()}
                        </div>
                    </div>
                </div>

                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, color: theme.colors.textTertiary, marginBottom: 6, marginLeft: 4, textTransform: 'uppercase' }}>
                    GESTIÓN
                </div>
                <div
                    style={{
                        backgroundColor: theme.colors.surface,
                        borderRadius: theme.radius.lg,
                        border: `1px solid ${theme.colors.border}`,
                        padding: 4,
                    }}
                >
                    {CARDS.map((card, idx) => (
                        <div key={card.to}>
                            <div
                                onClick={() => navigate(card.to)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    padding: 12,
                                    borderRadius: theme.radius.md,
                                    cursor: 'pointer',
                                }}
                            >
                                <div
                                    style={{
                                        width: 38,
                                        height: 38,
                                        borderRadius: 12,
                                        backgroundColor: card.tintBg,
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        flexShrink: 0,
                                    }}
                                >
                                    <card.icon size={18} color={card.tint} strokeWidth={2.2} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: theme.colors.text }}>{card.title}</div>
                                    <div style={{ fontSize: 12, color: theme.colors.textSecondary, marginTop: 1 }}>{card.subtitle}</div>
                                </div>
                                <ChevronRight size={16} color={theme.colors.textTertiary} />
                            </div>
                            {idx < CARDS.length - 1 && <div style={{ height: 1, backgroundColor: theme.colors.border, margin: '0 12px' }} />}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
