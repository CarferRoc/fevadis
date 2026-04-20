import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Activity } from '../types';
import { theme } from '../theme';
import { Calendar, MapPin, Users, ChevronRight } from 'lucide-react-native';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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
    const startDate = new Date(activity.fecha_inicio);
    const cat = CAT_COLORS[activity.categoria] ?? { bg: theme.colors.primaryLight, fg: theme.colors.primaryDark };

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        >
            <View style={styles.topRow}>
                <View style={[styles.catBadge, { backgroundColor: cat.bg }]}>
                    <Text style={[styles.catText, { color: cat.fg }]}>{activity.categoria}</Text>
                </View>
                <View style={styles.dateTag}>
                    <Text style={styles.dateDay}>{format(startDate, 'd', { locale: es })}</Text>
                    <Text style={styles.dateMonth}>{format(startDate, 'MMM', { locale: es }).toUpperCase()}</Text>
                </View>
            </View>

            <Text style={styles.title} numberOfLines={2}>
                {activity.titulo}
            </Text>

            {activity.descripcion ? (
                <Text style={styles.desc} numberOfLines={2}>
                    {activity.descripcion}
                </Text>
            ) : null}

            <View style={styles.meta}>
                <View style={styles.metaItem}>
                    <Calendar size={12} color={theme.colors.textTertiary} />
                    <Text style={styles.metaText}>
                        {format(startDate, "d MMM", { locale: es })}
                    </Text>
                </View>
                <View style={styles.metaDot} />
                <View style={styles.metaItem}>
                    <Users size={12} color={theme.colors.textTertiary} />
                    <Text style={styles.metaText}>{activity.plazas} plazas</Text>
                </View>
                {activity.ubicacion ? (
                    <>
                        <View style={styles.metaDot} />
                        <View style={[styles.metaItem, { flexShrink: 1 }]}>
                            <MapPin size={12} color={theme.colors.textTertiary} />
                            <Text style={styles.metaText} numberOfLines={1}>
                                {activity.ubicacion}
                            </Text>
                        </View>
                    </>
                ) : null}
            </View>

            {!hideEnrollButton && (
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Ver detalles</Text>
                    <ChevronRight size={14} color={theme.colors.primaryDark} />
                </View>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    pressed: {
        backgroundColor: theme.colors.primarySoft,
        borderColor: theme.colors.primaryLight,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    catBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: theme.radius.pill,
    },
    catText: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.2,
    },
    dateTag: {
        alignItems: 'center',
        minWidth: 44,
    },
    dateDay: {
        fontSize: 20,
        fontWeight: '800',
        color: theme.colors.text,
        lineHeight: 22,
    },
    dateMonth: {
        fontSize: 10,
        fontWeight: '700',
        color: theme.colors.textTertiary,
        letterSpacing: 0.8,
    },
    title: {
        ...theme.typography.h4,
        color: theme.colors.text,
        marginBottom: 4,
    },
    desc: {
        ...theme.typography.bodySmall,
        color: theme.colors.textSecondary,
        marginBottom: 10,
    },
    meta: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 6,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        fontWeight: '500',
    },
    metaDot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: theme.colors.borderStrong,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 12,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        gap: 2,
    },
    footerText: {
        fontSize: 12,
        fontWeight: '700',
        color: theme.colors.primaryDark,
    },
});
