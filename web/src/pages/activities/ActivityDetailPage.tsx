import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Calendar, MapPin, Users, ArrowLeft, Clock, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { activitiesService } from '../../services/activitiesService';
import { registrationsService } from '../../services/registrationsService';
import { Button } from '../../components/Button';
import { StatusBadge } from '../../components/StatusBadge';
import { useAuthStore } from '../../store/useAuthStore';
import { theme } from '../../theme';

const CAT_COLORS: Record<string, { bg: string; fg: string }> = {
    Ocio: { bg: theme.colors.catOcioSoft, fg: theme.colors.catOcio },
    Campamentos: { bg: theme.colors.catCampamentosSoft, fg: theme.colors.catCampamentos },
    Formaciones: { bg: theme.colors.catFormacionesSoft, fg: theme.colors.catFormaciones },
    Talleres: { bg: theme.colors.catTalleresSoft, fg: theme.colors.catTalleres },
};

export function ActivityDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [enrolling, setEnrolling] = useState(false);

    const { data: activity, isLoading } = useQuery({
        queryKey: ['activity', id],
        queryFn: () => activitiesService.getActivityById(id!),
        enabled: !!id,
    });

    const { data: registration, refetch: refetchReg } = useQuery({
        queryKey: ['my-registration', id, user?.id],
        queryFn: () => (user ? registrationsService.getMyRegistrationForActivity(user.id, id!) : null),
        enabled: !!user && !!id,
    });

    async function handleEnroll() {
        if (!user || !id) return;
        setEnrolling(true);
        try {
            await registrationsService.createRegistration(id, user.id);
            await refetchReg();
            toast.success('Inscripción enviada', { description: 'Tu solicitud está pendiente de aprobación.' });
        } catch (e: any) {
            toast.error('Error', { description: e.message });
        } finally {
            setEnrolling(false);
        }
    }

    if (isLoading || !activity) {
        return (
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: theme.colors.textSecondary }}>
                Cargando...
            </div>
        );
    }

    const startDate = new Date(activity.fecha_inicio);
    const endDate = new Date(activity.fecha_fin);
    const isPast = endDate < new Date();
    const cat = CAT_COLORS[activity.categoria] ?? { bg: theme.colors.primaryLight, fg: theme.colors.primaryDark };

    return (
        <div style={{ flex: 1, backgroundColor: theme.colors.background, display: 'flex', flexDirection: 'column', overflowY: 'auto', paddingBottom: 40 }}>
            <div
                style={{
                    padding: '8px 18px 20px',
                    paddingTop: 'calc(env(safe-area-inset-top, 0px) + 8px)',
                    backgroundColor: theme.colors.surface,
                    borderBottom: `1px solid ${theme.colors.border}`,
                }}
            >
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: theme.colors.surfaceAlt,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: 14,
                        border: 'none',
                        cursor: 'pointer',
                    }}
                    aria-label="Volver"
                >
                    <ArrowLeft size={18} color={theme.colors.text} />
                </button>
                <span
                    style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: 9999,
                        backgroundColor: cat.bg,
                        color: cat.fg,
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: 0.4,
                        marginBottom: 10,
                    }}
                >
                    {activity.categoria}
                </span>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: theme.colors.text, letterSpacing: -0.4, lineHeight: '30px', margin: 0 }}>
                    {activity.titulo}
                </h1>
            </div>

            <div
                style={{
                    backgroundColor: theme.colors.surface,
                    margin: '14px 14px 0',
                    borderRadius: theme.radius.lg,
                    border: `1px solid ${theme.colors.border}`,
                    padding: 4,
                }}
            >
                <InfoRow
                    icon={<Calendar size={16} color={theme.colors.primaryDark} />}
                    label="Inicio"
                    text={format(startDate, "EEEE d 'de' MMMM", { locale: es })}
                    sub={format(startDate, "HH:mm 'h'", { locale: es })}
                />
                <Divider />
                <InfoRow
                    icon={<Clock size={16} color={theme.colors.primaryDark} />}
                    label="Fin"
                    text={format(endDate, "EEEE d 'de' MMMM", { locale: es })}
                    sub={format(endDate, "HH:mm 'h'", { locale: es })}
                />
                {activity.ubicacion && (
                    <>
                        <Divider />
                        <InfoRow
                            icon={<MapPin size={16} color={theme.colors.primaryDark} />}
                            label="Ubicación"
                            text={activity.ubicacion}
                        />
                    </>
                )}
                <Divider />
                <InfoRow
                    icon={<Users size={16} color={theme.colors.primaryDark} />}
                    label="Plazas"
                    text={`${activity.plazas} plazas disponibles`}
                />
            </div>

            {activity.descripcion && (
                <div
                    style={{
                        margin: '14px 14px 0',
                        backgroundColor: theme.colors.surface,
                        borderRadius: theme.radius.lg,
                        border: `1px solid ${theme.colors.border}`,
                        padding: 16,
                    }}
                >
                    <div style={{ fontSize: 15, fontWeight: 700, color: theme.colors.text, marginBottom: 6 }}>Descripción</div>
                    <div style={{ fontSize: 14, lineHeight: '22px', color: theme.colors.textSecondary, whiteSpace: 'pre-wrap' }}>
                        {activity.descripcion}
                    </div>
                </div>
            )}

            <div style={{ padding: '14px 18px 8px' }}>
                {isPast ? (
                    <div style={{ backgroundColor: theme.colors.surfaceMuted, padding: 14, borderRadius: theme.radius.lg, textAlign: 'center' }}>
                        <span style={{ fontSize: 14, color: theme.colors.textSecondary, fontWeight: 600 }}>Esta actividad ya ha finalizado</span>
                    </div>
                ) : registration ? (
                    <div
                        style={{
                            backgroundColor: theme.colors.primarySoft,
                            borderRadius: theme.radius.lg,
                            padding: 14,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 8,
                            border: `1px solid ${theme.colors.primaryLight}`,
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                            <CheckCircle2 size={18} color={theme.colors.primaryDark} />
                            <span style={{ fontSize: 15, fontWeight: 700, color: theme.colors.primaryDarker }}>Ya estás inscrito</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 13, color: theme.colors.textSecondary, fontWeight: 600 }}>Inscripción</span>
                            <StatusBadge status={registration.status} />
                        </div>
                        {registration.attendance !== 'pendiente' && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 13, color: theme.colors.textSecondary, fontWeight: 600 }}>Asistencia</span>
                                <span style={{ fontSize: 14, fontWeight: 600, color: theme.colors.text }}>
                                    {registration.attendance === 'asistio' ? 'Asististe ✓' : 'No asististe'}
                                </span>
                            </div>
                        )}
                    </div>
                ) : (
                    <Button title="Apuntarme a esta actividad" onPress={handleEnroll} loading={enrolling} size="lg" fullWidth />
                )}
            </div>
        </div>
    );
}

function InfoRow({ icon, label, text, sub }: { icon: React.ReactNode; label: string; text: string; sub?: string }) {
    return (
        <div style={{ display: 'flex', gap: 10, padding: 12, alignItems: 'flex-start' }}>
            <div
                style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    backgroundColor: theme.colors.primaryLight,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 2,
                    flexShrink: 0,
                }}
            >
                {icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: theme.colors.textTertiary, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                    {label}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: theme.colors.text, marginTop: 2 }}>{text}</div>
                {sub ? <div style={{ fontSize: 13, color: theme.colors.textSecondary, marginTop: 1 }}>{sub}</div> : null}
            </div>
        </div>
    );
}

function Divider() {
    return <div style={{ height: 1, backgroundColor: theme.colors.border, margin: '0 12px' }} />;
}
