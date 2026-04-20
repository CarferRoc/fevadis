import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ClipboardList, Plus } from 'lucide-react';
import { activitiesService } from '../../services/activitiesService';
import { useAuthStore } from '../../store/useAuthStore';
import type { ActivityCategory } from '../../types';
import { EmptyState } from '../../components/EmptyState';
import { ActivityCard } from '../../components/ActivityCard';
import { Logo } from '../../components/Logo';
import { theme } from '../../theme';

const CATEGORIES: (ActivityCategory | 'Todas')[] = ['Todas', 'Ocio', 'Campamentos', 'Formaciones', 'Talleres'];

export function ActivitiesPage() {
    const navigate = useNavigate();
    const { isAdminOrEditor, profile } = useAuthStore();
    const [selectedCat, setSelectedCat] = useState<ActivityCategory | 'Todas'>('Todas');

    const { data: activities, isLoading } = useQuery({
        queryKey: ['activities', selectedCat],
        queryFn: () => activitiesService.getActivities(selectedCat),
    });

    const greet = profile?.nombre ? `Hola, ${profile.nombre}` : 'Bienvenid@';

    return (
        <div style={{ flex: 1, backgroundColor: theme.colors.background, display: 'flex', flexDirection: 'column', minHeight: 0, position: 'relative', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 18px 12px', paddingTop: 'calc(env(safe-area-inset-top, 0px) + 8px)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Logo size={28} />
                    <span style={{ fontSize: 17, fontWeight: 800, color: theme.colors.text, letterSpacing: -0.3 }}>fevadis</span>
                </div>
                <button
                    onClick={() => navigate('/activities/my')}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        backgroundColor: theme.colors.primaryLight,
                        padding: '6px 11px',
                        borderRadius: 9999,
                        border: 'none',
                        cursor: 'pointer',
                    }}
                >
                    <ClipboardList size={14} color={theme.colors.primaryDark} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: theme.colors.primaryDark }}>Las mías</span>
                </button>
            </div>

            <div style={{ padding: '0 18px 14px' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: theme.colors.textSecondary }}>{greet}</div>
                <div style={{ fontSize: 30, fontWeight: 800, color: theme.colors.text, marginTop: 2, letterSpacing: -0.6, lineHeight: '36px' }}>
                    Actividades
                </div>
                <div style={{ fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 }}>
                    Descubre y apúntate a lo que viene
                </div>
            </div>

            <div
                className="hide-scrollbar"
                style={{
                    display: 'flex',
                    gap: 6,
                    padding: '6px 18px',
                    overflowX: 'auto',
                    whiteSpace: 'nowrap',
                    maxHeight: 46,
                }}
            >
                {CATEGORIES.map((cat) => {
                    const active = selectedCat === cat;
                    return (
                        <button
                            key={cat}
                            onClick={() => setSelectedCat(cat)}
                            style={{
                                padding: '7px 14px',
                                borderRadius: 9999,
                                backgroundColor: active ? theme.colors.text : theme.colors.surface,
                                border: `1px solid ${active ? theme.colors.text : theme.colors.border}`,
                                color: active ? '#fff' : theme.colors.textSecondary,
                                fontSize: 12.5,
                                fontWeight: 600,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {cat}
                        </button>
                    );
                })}
            </div>

            <div style={{ flex: 1, padding: '10px 18px 100px' }}>
                {activities && activities.length > 0 ? (
                    activities.map((a) => (
                        <ActivityCard key={a.id} activity={a} onPress={() => navigate(`/activities/${a.id}`)} />
                    ))
                ) : isLoading ? null : (
                    <EmptyState
                        icon="🗓️"
                        title="Sin actividades"
                        subtitle="No hay actividades en esta categoría por ahora."
                    />
                )}
            </div>

            {isAdminOrEditor && (
                <button
                    onClick={() => navigate('/admin')}
                    style={{
                        position: 'fixed',
                        bottom: 'calc(78px + env(safe-area-inset-bottom, 0px))',
                        right: 'max(20px, calc((100vw - 520px) / 2 + 20px))',
                        width: 52,
                        height: 52,
                        borderRadius: 26,
                        backgroundColor: theme.colors.primary,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        boxShadow: '0 6px 16px rgba(26,36,22,0.25)',
                        border: 'none',
                        cursor: 'pointer',
                        zIndex: 15,
                    }}
                    aria-label="Admin"
                >
                    <Plus color="#fff" size={22} strokeWidth={2.6} />
                </button>
            )}
        </div>
    );
}
