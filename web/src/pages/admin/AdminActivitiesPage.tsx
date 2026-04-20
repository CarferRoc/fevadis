import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { activitiesService } from '../../services/activitiesService';
import { AdminHeader } from '../../components/AdminHeader';
import { EmptyState } from '../../components/EmptyState';
import type { Activity } from '../../types';
import { theme } from '../../theme';

export function AdminActivitiesPage() {
    const navigate = useNavigate();
    const { data: activities, isLoading, refetch } = useQuery({
        queryKey: ['admin-activities'],
        queryFn: () => activitiesService.getActivities(),
    });

    async function handleDelete(activity: Activity) {
        if (!window.confirm(`¿Seguro que quieres eliminar "${activity.titulo}"?`)) return;
        try {
            await activitiesService.deleteActivity(activity.id);
            refetch();
        } catch (e: any) {
            toast.error('Error', { description: e.message });
        }
    }

    return (
        <div style={{ flex: 1, backgroundColor: theme.colors.background, display: 'flex', flexDirection: 'column', overflowY: 'auto', position: 'relative' }}>
            <AdminHeader title="Actividades" back />

            {isLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                    <div
                        style={{
                            width: 32,
                            height: 32,
                            border: `3px solid ${theme.colors.primaryLight}`,
                            borderTopColor: theme.colors.primary,
                            borderRadius: '50%',
                            animation: 'fevadis-spin 0.8s linear infinite',
                        }}
                    />
                </div>
            ) : (
                <div style={{ padding: 16, paddingBottom: 100 }}>
                    {activities && activities.length > 0 ? (
                        activities.map((item) => (
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
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span
                                        style={{
                                            backgroundColor: theme.colors.primaryLight + '33',
                                            padding: '3px 10px',
                                            borderRadius: 9999,
                                            fontSize: 11,
                                            fontWeight: 700,
                                            color: theme.colors.primary,
                                            textTransform: 'uppercase',
                                        }}
                                    >
                                        {item.categoria}
                                    </span>
                                    <span style={{ fontSize: 12, color: theme.colors.textSecondary }}>
                                        {format(new Date(item.fecha_inicio), 'd MMM yyyy', { locale: es })}
                                    </span>
                                </div>
                                <div style={{ fontSize: 15, fontWeight: 700, color: theme.colors.text, lineHeight: '20px' }}>
                                    {item.titulo}
                                </div>
                                <div style={{ display: 'flex', gap: 16, paddingTop: 4 }}>
                                    <button
                                        onClick={() => navigate(`/admin/activities/${item.id}/edit`)}
                                        style={{ ...textBtn, color: theme.colors.primary }}
                                    >
                                        <Pencil size={16} color={theme.colors.primary} />
                                        <span>Editar</span>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item)}
                                        style={{ ...textBtn, color: theme.colors.error }}
                                    >
                                        <Trash2 size={16} color={theme.colors.error} />
                                        <span>Eliminar</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <EmptyState icon="🗓️" title="Sin actividades" subtitle="Crea la primera actividad." />
                    )}
                </div>
            )}

            <button
                onClick={() => navigate('/admin/activities/new')}
                style={{
                    position: 'fixed',
                    bottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
                    right: 'max(20px, calc((100vw - 520px) / 2 + 20px))',
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: theme.colors.primary,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 6px 16px rgba(26,36,22,0.25)',
                    zIndex: 15,
                }}
                aria-label="Nueva actividad"
            >
                <Plus color="#fff" size={26} />
            </button>
            <style>{`@keyframes fevadis-spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

const textBtn: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    padding: 0,
};
