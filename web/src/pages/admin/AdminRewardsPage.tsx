import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Gift, Edit2, Trash2 } from 'lucide-react';
import { rewardsService } from '../../services/rewardsService';
import { EmptyState } from '../../components/EmptyState';
import { Button } from '../../components/Button';
import { AdminHeader } from '../../components/AdminHeader';
import { theme } from '../../theme';

export function AdminRewardsPage() {
    const navigate = useNavigate();
    const qc = useQueryClient();

    const { data: rewards, isLoading } = useQuery({
        queryKey: ['admin-rewards'],
        queryFn: rewardsService.getAllRewards,
    });

    const deleteMutation = useMutation({
        mutationFn: rewardsService.deleteReward,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin-rewards'] });
            toast.success('Recompensa eliminada');
        },
        onError: (error: any) => toast.error('Error', { description: error.message }),
    });

    function handleDelete(id: string) {
        if (!window.confirm('¿Estás seguro de que quieres eliminar esta recompensa?')) return;
        deleteMutation.mutate(id);
    }

    return (
        <div style={{ flex: 1, backgroundColor: theme.colors.background, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <AdminHeader title="Gestión de Recompensas" back right={<Button title="+ Nueva" onPress={() => navigate('/admin/rewards/new')} size="sm" variant="outline" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none' }} />} />

            <div style={{ padding: 16, paddingBottom: 32 }}>
                {isLoading ? (
                    <div style={{ textAlign: 'center', color: theme.colors.textSecondary, padding: 24 }}>Cargando…</div>
                ) : rewards && rewards.length > 0 ? (
                    rewards.map((item) => (
                        <div
                            key={item.id}
                            style={{
                                backgroundColor: theme.colors.surface,
                                borderRadius: theme.radius.lg,
                                padding: 12,
                                marginBottom: 12,
                                borderLeft: `4px solid ${theme.colors.accent}`,
                                boxShadow: '0 2px 6px rgba(26,36,22,0.05)',
                            }}
                        >
                            <div style={{ marginBottom: 8 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                                    <div style={{ fontSize: 17, fontWeight: 700, color: theme.colors.text, flex: 1, marginRight: 8 }}>
                                        {item.titulo}
                                    </div>
                                    <div
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            backgroundColor: theme.colors.accent + '33',
                                            padding: '6px 10px',
                                            borderRadius: 9999,
                                            gap: 6,
                                        }}
                                    >
                                        <Gift size={12} color={theme.colors.accent} />
                                        <span style={{ fontSize: 12, fontWeight: 800, color: theme.colors.accent }}>{item.costo_puntos} pts</span>
                                    </div>
                                </div>
                                {item.descripcion && (
                                    <div style={{ fontSize: 14, color: theme.colors.textSecondary, marginBottom: 10, lineHeight: '20px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                        {item.descripcion}
                                    </div>
                                )}
                                <div style={{ fontSize: 12, fontWeight: 600, color: theme.colors.textTertiary }}>
                                    Stock: {item.stock === null || item.stock === undefined ? 'Ilimitado' : item.stock}
                                </div>
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    gap: 12,
                                    paddingTop: 8,
                                    borderTop: `1px solid ${theme.colors.border}`,
                                    justifyContent: 'flex-end',
                                }}
                            >
                                <button
                                    onClick={() => navigate(`/admin/rewards/${item.id}/edit`)}
                                    style={{ ...iconBtn, backgroundColor: theme.colors.primaryLight + '33' }}
                                    aria-label="Editar"
                                >
                                    <Edit2 size={16} color={theme.colors.primary} />
                                </button>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    style={{ ...iconBtn, backgroundColor: theme.colors.error + '1A' }}
                                    aria-label="Eliminar"
                                >
                                    <Trash2 size={16} color={theme.colors.error} />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <EmptyState icon="🎁" title="Sin recompensas" subtitle="Empieza creando la primera recompensa." />
                )}
            </div>
        </div>
    );
}

const iconBtn: React.CSSProperties = {
    width: 40,
    height: 40,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.radius.md,
    border: 'none',
    cursor: 'pointer',
};
