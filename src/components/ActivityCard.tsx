import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Activity } from '../types';
import { theme } from '../theme';
import { Calendar, MapPin, Users } from 'lucide-react-native';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ActivityCardProps {
    activity: Activity;
    onPress?: () => void;
    /** Oculta el botón Inscribirse (para vistas de admin) */
    hideEnrollButton?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
    Ocio: theme.colors.catOcio,
    Campamentos: theme.colors.catCampamentos,
    Formaciones: theme.colors.catFormaciones,
    Talleres: theme.colors.catTalleres,
};

export function ActivityCard({ activity, onPress, hideEnrollButton }: ActivityCardProps) {
    const startDate = new Date(activity.fecha_inicio);
    const catColor = CATEGORY_COLORS[activity.categoria] ?? theme.colors.primary;

    return (
        <View style={styles.card}>
            {/* Top row: título + badge */}
            <View style={styles.cardTop}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                    {activity.titulo}
                </Text>
                <View style={[styles.categoryBadge, { backgroundColor: catColor }]}>
                    <Text style={styles.categoryText}>{activity.categoria}</Text>
                </View>
            </View>

            {/* Descripción */}
            {activity.descripcion ? (
                <Text style={styles.cardDesc} numberOfLines={2}>
                    {activity.descripcion}
                </Text>
            ) : null}

            <View style={styles.divider} />

            {/* Meta */}
            <View style={styles.cardMeta}>
                <View style={styles.metaRow}>
                    <Calendar size={13} color={theme.colors.textTertiary} />
                    <Text style={styles.metaText}>
                        {format(startDate, "d 'de' MMMM yyyy", { locale: es })}
                    </Text>
                </View>
                <View style={styles.metaRow}>
                    <Users size={13} color={theme.colors.textTertiary} />
                    <Text style={styles.metaText}>
                        {activity.plazas} plazas disponibles
                    </Text>
                </View>
                {activity.ubicacion ? (
                    <View style={styles.metaRow}>
                        <MapPin size={13} color={theme.colors.textTertiary} />
                        <Text style={styles.metaText} numberOfLines={1}>
                            {activity.ubicacion}
                        </Text>
                    </View>
                ) : null}
            </View>

            {/* Botón Inscribirse */}
            {!hideEnrollButton && (
                <View style={styles.cardFooter}>
                    <TouchableOpacity
                        style={styles.enrollBtn}
                        onPress={onPress}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.enrollBtnText}>Inscribirse</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.sm + 4,
        ...theme.shadow.sm,
    },
    cardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 10,
        marginBottom: 8,
    },
    cardTitle: {
        ...theme.typography.h4,
        color: theme.colors.text,
        flex: 1,
        lineHeight: 22,
    },
    categoryBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: theme.borderRadius.full,
        flexShrink: 0,
    },
    categoryText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#fff',
    },
    cardDesc: {
        ...theme.typography.bodySmall,
        color: theme.colors.textSecondary,
        lineHeight: 18,
        marginBottom: 10,
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginVertical: 8,
    },
    cardMeta: { gap: 6 },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
    },
    metaText: {
        ...theme.typography.bodySmall,
        color: theme.colors.textSecondary,
        flex: 1,
    },
    cardFooter: {
        alignItems: 'flex-end',
        marginTop: 12,
    },
    enrollBtn: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 22,
        paddingVertical: 9,
        borderRadius: theme.borderRadius.full,
    },
    enrollBtnText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '700',
    },
});
