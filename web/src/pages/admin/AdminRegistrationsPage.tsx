import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { registrationsService } from '../../services/registrationsService';
import { documentService } from '../../services/documentService';
import { useAuthStore } from '../../store/useAuthStore';
import { StatusBadge, AttendanceBadge } from '../../components/StatusBadge';
import { EmptyState } from '../../components/EmptyState';
import { Button } from '../../components/Button';
import { AdminHeader } from '../../components/AdminHeader';
import { theme } from '../../theme';
import type { Registration, RegistrationStatus, AttendanceStatus } from '../../types';

type FilterType = 'todas' | 'pendiente' | 'aceptado';

export function AdminRegistrationsPage() {
    const { user } = useAuthStore();
    const [filter, setFilter] = useState<FilterType>('pendiente');

    const { data: registrations, refetch, isLoading, error } = useQuery({
        queryKey: ['admin-registrations'],
        queryFn: registrationsService.getAllRegistrations,
        retry: false,
    });

    const filtered = (registrations ?? []).filter((r) => {
        if (filter === 'todas') return true;
        return r.status === filter;
    });

    async function updateStatus(reg: Registration, status: RegistrationStatus) {
        if (!user) return;
        if (status === 'aceptado') {
            const nombre = `${reg.profile?.nombre ?? ''} ${reg.profile?.apellidos ?? ''}`.trim();
            if (!window.confirm(`¿Seguro que quieres que ${nombre || 'esta persona'} asista al evento "${reg.activity?.titulo ?? ''}"?`)) return;
        }
        try {
            await registrationsService.updateStatus(reg.id, status, user.id);
            refetch();
        } catch (e: any) {
            toast.error('Error', { description: e.message });
        }
    }

    async function markAttendance(reg: Registration, attendance: AttendanceStatus) {
        if (!user) return;
        if (attendance === 'asistio') {
            const withCert = window.confirm('¿Subir certificado de voluntariado?\n\nAceptar: subir certificado\nCancelar: marcar sin certificado');
            try {
                await registrationsService.markAttendance(reg.id, attendance, user.id);
                if (withCert) {
                    await documentService.pickAndUploadCertificate(reg.id, reg.activity_id, reg.user_id, user.id);
                    toast.success('Certificado subido', { description: 'Asistencia marcada y certificado guardado.' });
                }
                refetch();
            } catch (e: any) {
                if (e.message !== 'No se seleccionó ningún archivo') {
                    toast.error('Error', { description: e.message });
                }
            }
            return;
        }
        try {
            await registrationsService.markAttendance(reg.id, attendance, user.id);
            refetch();
        } catch (e: any) {
            toast.error('Error', { description: e.message });
        }
    }

    return (
        <div style={{ flex: 1, backgroundColor: theme.colors.background, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <AdminHeader title="Inscripciones" back />

            {error && (
                <div style={{ backgroundColor: theme.colors.error, padding: 12, color: '#fff', fontSize: 13, fontWeight: 600 }}>
                    Error: {(error as any)?.message ?? 'Error desconocido'}
                </div>
            )}

            <div style={{ display: 'flex', backgroundColor: theme.colors.surface, borderBottom: `1px solid ${theme.colors.border}` }}>
                {(['pendiente', 'aceptado', 'todas'] as FilterType[]).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        style={{
                            flex: 1,
                            padding: '12px 0',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: `2px solid ${filter === f ? theme.colors.primary : 'transparent'}`,
                            color: filter === f ? theme.colors.primary : theme.colors.textSecondary,
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            <div style={{ padding: 16, paddingBottom: 32 }}>
                {isLoading ? (
                    <div style={{ textAlign: 'center', color: theme.colors.textSecondary, padding: 24 }}>Cargando…</div>
                ) : filtered.length > 0 ? (
                    filtered.map((item) => (
                        <div
                            key={item.id}
                            style={{
                                backgroundColor: theme.colors.surface,
                                borderRadius: theme.radius.lg,
                                padding: 12,
                                marginBottom: 12,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 8,
                                boxShadow: '0 2px 6px rgba(26,36,22,0.05)',
                            }}
                        >
                            <div style={{ fontSize: 15, fontWeight: 700, color: theme.colors.primary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {item.activity?.titulo ?? 'Actividad'}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 15, fontWeight: 700, color: theme.colors.text }}>
                                        {item.profile?.nombre} {item.profile?.apellidos}
                                    </div>
                                    <div style={{ fontSize: 12, color: theme.colors.textSecondary }}>{item.profile?.dni}</div>
                                </div>
                                <StatusBadge status={item.status} />
                            </div>
                            {item.activity?.fecha_inicio && (
                                <div style={{ fontSize: 12, color: theme.colors.textSecondary }}>
                                    {format(new Date(item.activity.fecha_inicio), 'd MMM yyyy', { locale: es })}
                                </div>
                            )}

                            {item.status === 'pendiente' && (
                                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                                    <Button title="Aceptar" variant="secondary" size="sm" onPress={() => updateStatus(item, 'aceptado')} style={{ flex: 1 }} />
                                    <Button title="Rechazar" variant="danger" size="sm" onPress={() => updateStatus(item, 'rechazado')} style={{ flex: 1 }} />
                                </div>
                            )}

                            {item.status === 'aceptado' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 8, borderTop: `1px solid ${theme.colors.border}` }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: theme.colors.textSecondary }}>Asistencia:</span>
                                        <AttendanceBadge attendance={item.attendance} />
                                    </div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <Button
                                            title="Asistió ✓"
                                            variant={item.attendance === 'asistio' ? 'secondary' : 'outline'}
                                            size="sm"
                                            onPress={() => markAttendance(item, 'asistio')}
                                            style={{ flex: 1 }}
                                        />
                                        <Button
                                            title="No asistió"
                                            variant={item.attendance === 'no_asistio' ? 'danger' : 'outline'}
                                            size="sm"
                                            onPress={() => markAttendance(item, 'no_asistio')}
                                            style={{ flex: 1 }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <EmptyState
                        icon="📋"
                        title={error ? 'Error cargando' : 'Sin inscripciones'}
                        subtitle={error ? (error as any)?.message ?? 'Error desconocido' : `No hay inscripciones en estado "${filter}"`}
                    />
                )}
            </div>
        </div>
    );
}
