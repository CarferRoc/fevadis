import type { Activity } from '../types';
import { theme } from '../theme';
import { Calendar, MapPin, Users, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';

interface ActivityCardProps {
    activity: Activity;
    onPress?: () => void;
    hideEnrollButton?: boolean;
}

const CAT_COLORS: Record<string, { bg: string; fg: string }> = {
    Ocio: { bg: theme.colors.catOcioSoft, fg: theme.colors.catOcio },
    Campamentos: { bg: theme.colors.catCampamentosSoft, fg: theme.colors.catCampamentos },
    Formaciones: { bg: theme.colors.catFormacionesSoft, fg: theme.colors.catFormaciones },
    Talleres: { bg: theme.colors.catTalleresSoft, fg: theme.colors.catTalleres },
};

export function ActivityCard({ activity, onPress, hideEnrollButton }: ActivityCardProps) {
    const [pressed, setPressed] = useState(false);
    const startDate = new Date(activity.fecha_inicio);
    const cat = CAT_COLORS[activity.categoria] ?? { bg: theme.colors.primaryLight, fg: theme.colors.primaryDark };

    return (
        <div
            onClick={onPress}
            onMouseDown={() => setPressed(true)}
            onMouseUp={() => setPressed(false)}
            onMouseLeave={() => setPressed(false)}
            onTouchStart={() => setPressed(true)}
            onTouchEnd={() => setPressed(false)}
            style={{
                backgroundColor: pressed ? theme.colors.primarySoft : theme.colors.surface,
                borderRadius: theme.radius.lg,
                padding: 14,
                marginBottom: 10,
                border: `1px solid ${pressed ? theme.colors.primaryLight : theme.colors.border}`,
                cursor: onPress ? 'pointer' : 'default',
                transition: 'background-color 120ms',
            }}
        >
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ padding: '3px 8px', borderRadius: 9999, backgroundColor: cat.bg }}>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.2, color: cat.fg }}>
                        {activity.categoria}
                    </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 44 }}>
                    <span style={{ fontSize: 20, fontWeight: 800, color: theme.colors.text, lineHeight: '22px' }}>
                        {format(startDate, 'd', { locale: es })}
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: theme.colors.textTertiary, letterSpacing: 0.8 }}>
                        {format(startDate, 'MMM', { locale: es }).toUpperCase()}
                    </span>
                </div>
            </div>

            <div style={{ fontSize: 15, fontWeight: 700, lineHeight: '20px', color: theme.colors.text, marginBottom: 4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {activity.titulo}
            </div>

            {activity.descripcion ? (
                <div style={{ fontSize: 13, lineHeight: '18px', color: theme.colors.textSecondary, marginBottom: 10, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {activity.descripcion}
                </div>
            ) : null}

            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Calendar size={12} color={theme.colors.textTertiary} />
                    <span style={{ fontSize: 12, color: theme.colors.textSecondary, fontWeight: 500 }}>
                        {format(startDate, 'd MMM', { locale: es })}
                    </span>
                </div>
                <span style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: theme.colors.borderStrong }} />
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Users size={12} color={theme.colors.textTertiary} />
                    <span style={{ fontSize: 12, color: theme.colors.textSecondary, fontWeight: 500 }}>
                        {activity.plazas} plazas
                    </span>
                </div>
                {activity.ubicacion ? (
                    <>
                        <span style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: theme.colors.borderStrong }} />
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, flexShrink: 1, minWidth: 0 }}>
                            <MapPin size={12} color={theme.colors.textTertiary} />
                            <span style={{ fontSize: 12, color: theme.colors.textSecondary, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {activity.ubicacion}
                            </span>
                        </div>
                    </>
                ) : null}
            </div>

            {!hideEnrollButton && (
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 12, paddingTop: 10, borderTop: `1px solid ${theme.colors.border}`, gap: 2 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: theme.colors.primaryDark }}>Ver detalles</span>
                    <ChevronRight size={14} color={theme.colors.primaryDark} />
                </div>
            )}
        </div>
    );
}
