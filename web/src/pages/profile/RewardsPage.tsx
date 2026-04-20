import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Gift, Lock } from 'lucide-react';
import { theme } from '../../theme';
import { rewardsService } from '../../services/rewardsService';
import type { Reward } from '../../types';
import { Header } from '../../components/Header';

export function RewardsPage() {
    const [search] = useSearchParams();
    const puntos = Number(search.get('puntos') ?? 0);

    const { data: rewards, isLoading } = useQuery({
        queryKey: ['rewards-catalog'],
        queryFn: rewardsService.getAllRewards,
    });

    function handleRedeem(reward: Reward) {
        if (puntos < reward.costo_puntos) {
            alert('Puntos insuficientes: No tienes suficientes puntos para canjear esta recompensa.');
            return;
        }
        alert(`¿Quieres canjear "${reward.titulo}" por ${reward.costo_puntos} puntos?\n\n(Nota: función de canje en desarrollo)`);
    }

    return (
        <div style={{ flex: 1, backgroundColor: theme.colors.background, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <Header title="Recompensas" back />

            <div style={{ paddingBottom: 32 }}>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '32px 24px',
                        backgroundColor: theme.colors.primary + '10',
                        borderBottom: `1px solid ${theme.colors.primary}20`,
                        marginBottom: 24,
                    }}
                >
                    <div
                        style={{
                            width: 80,
                            height: 80,
                            borderRadius: 40,
                            backgroundColor: theme.colors.primary + '20',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginBottom: 12,
                        }}
                    >
                        <Gift size={48} color={theme.colors.primary} />
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: theme.colors.text, marginBottom: 12 }}>Mis Recompensas</div>
                    <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1, color: theme.colors.textSecondary, textTransform: 'uppercase', marginBottom: 4 }}>
                        Puntos Disponibles
                    </div>
                    <div style={{ fontSize: 48, fontWeight: 800, color: theme.colors.primary }}>{puntos}</div>
                </div>

                <div style={{ padding: '0 16px' }}>
                    <div style={{ fontSize: 17, fontWeight: 700, color: theme.colors.text, marginBottom: 12 }}>Catálogo de Recompensas</div>

                    {isLoading ? (
                        <div style={{ textAlign: 'center', color: theme.colors.textSecondary, margin: '24px 0' }}>
                            Cargando recompensas...
                        </div>
                    ) : rewards && rewards.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {rewards.map((item) => {
                                const canAfford = puntos >= item.costo_puntos;
                                return (
                                    <div
                                        key={item.id}
                                        style={{
                                            backgroundColor: theme.colors.surface,
                                            borderRadius: theme.radius.md,
                                            padding: 12,
                                            boxShadow: '0 2px 6px rgba(26,36,22,0.05)',
                                            opacity: canAfford ? 1 : 0.8,
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                            <div style={{ fontSize: 15, fontWeight: 700, color: theme.colors.text, flex: 1, paddingRight: 8 }}>
                                                {item.titulo}
                                            </div>
                                            <div
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    backgroundColor: theme.colors.background,
                                                    padding: '4px 8px',
                                                    borderRadius: 9999,
                                                    gap: 4,
                                                }}
                                            >
                                                <Gift size={12} color={canAfford ? theme.colors.accent : theme.colors.textSecondary} />
                                                <span style={{ fontSize: 12, fontWeight: 600, color: canAfford ? theme.colors.accent : theme.colors.textSecondary }}>
                                                    {item.costo_puntos} pts
                                                </span>
                                            </div>
                                        </div>
                                        {item.descripcion && (
                                            <div style={{ fontSize: 13, color: theme.colors.textSecondary, marginBottom: 12 }}>
                                                {item.descripcion}
                                            </div>
                                        )}
                                        <button
                                            onClick={() => handleRedeem(item)}
                                            style={{
                                                width: '100%',
                                                backgroundColor: canAfford ? theme.colors.primary : theme.colors.border,
                                                color: canAfford ? '#fff' : theme.colors.textSecondary,
                                                padding: '10px 0',
                                                border: 'none',
                                                borderRadius: theme.radius.sm,
                                                fontSize: 14,
                                                fontWeight: 700,
                                                cursor: canAfford ? 'pointer' : 'not-allowed',
                                            }}
                                        >
                                            Canjear
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div
                            style={{
                                backgroundColor: theme.colors.surface,
                                borderRadius: theme.radius.lg,
                                padding: 24,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 12,
                                boxShadow: '0 2px 6px rgba(26,36,22,0.05)',
                            }}
                        >
                            <Lock size={32} color={theme.colors.textSecondary} />
                            <div style={{ fontSize: 14, color: theme.colors.textSecondary, textAlign: 'center', lineHeight: '24px' }}>
                                Próximamente añadiremos nuevas recompensas.
                                <br />
                                ¡Sigue participando para acumular más puntos!
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
