import { useQuery } from '@tanstack/react-query';
import { Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuthStore } from '../../store/useAuthStore';
import { registrationsService } from '../../services/registrationsService';
import { StatusBadge, AttendanceBadge } from '../../components/StatusBadge';
import { EmptyState } from '../../components/EmptyState';
import { Header } from '../../components/Header';
import { theme } from '../../theme';

export function MyRegistrationsPage() {
    const { user } = useAuthStore();
    const { data, isLoading } = useQuery({
        queryKey: ['my-registrations', user?.id],
        queryFn: () => (user ? registrationsService.getMyRegistrations(user.id) : []),
        enabled: !!user,
    });

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: theme.colors.background, overflowY: 'auto' }}>
            <Header title="Mis Inscripciones" back />
            <div style={{ padding: 16 }}>
                {data && data.length > 0 ? (
                    data.map((item) => {
                        const act = item.activity;
                        const startDate = act?.fecha_inicio ? new Date(act.fecha_inicio) : null;
                        return (
                            <div
                                key={item.id}
                                style={{
                                    backgroundColor: theme.colors.surface,
                                    borderRadius: theme.radius.lg,
                                    padding: 14,
                                    marginBottom: 10,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 6,
                                    border: `1px solid ${theme.colors.border}`,
                                }}
                            >
                                <div style={{ fontSize: 15, fontWeight: 700, color: theme.colors.text, lineHeight: '20px' }}>
                                    {act?.titulo ?? 'Actividad'}
                                </div>
                                {startDate && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <Calendar size={13} color={theme.colors.textSecondary} />
                                        <span style={{ fontSize: 13, color: theme.colors.textSecondary }}>
                                            {format(startDate, 'd MMM yyyy, HH:mm', { locale: es })}
                                        </span>
                                    </div>
                                )}
                                {act?.ubicacion && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <MapPin size={13} color={theme.colors.textSecondary} />
                                        <span style={{ fontSize: 13, color: theme.colors.textSecondary }}>{act.ubicacion}</span>
                                    </div>
                                )}
                                <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                                    <StatusBadge status={item.status} />
                                    {item.status === 'aceptado' && <AttendanceBadge attendance={item.attendance} />}
                                </div>
                            </div>
                        );
                    })
                ) : isLoading ? null : (
                    <EmptyState
                        icon="📝"
                        title="Sin inscripciones"
                        subtitle="Todavía no te has apuntado a ninguna actividad."
                    />
                )}
            </div>
        </div>
    );
}
