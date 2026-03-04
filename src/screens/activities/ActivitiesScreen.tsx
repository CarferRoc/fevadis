import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { activitiesService } from '../../services/activitiesService';
import { theme } from '../../theme';
import { useAuthStore } from '../../store/useAuthStore';
import { ActivitiesStackParamList } from '../../types/navigation';
import { Activity, ActivityCategory } from '../../types';
import { EmptyState } from '../../components/EmptyState';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, MapPin, Users, Plus, ClipboardList } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Nav = NativeStackNavigationProp<ActivitiesStackParamList, 'ActivitiesList'>;

const CATEGORIES: (ActivityCategory | 'Todas')[] = [
    'Todas', 'Ocio', 'Campamentos', 'Formaciones', 'Talleres',
];

const CATEGORY_COLORS: Record<string, string> = {
    Ocio: theme.colors.catOcio,
    Campamentos: theme.colors.catCampamentos,
    Formaciones: theme.colors.catFormaciones,
    Talleres: theme.colors.catTalleres,
};

function ActivityCard({
    activity,
    onPress,
}: {
    activity: Activity;
    onPress: () => void;
}) {
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

            {/* Separador */}
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

            {/* Footer: botón inscribirse */}
            <View style={styles.cardFooter}>
                <TouchableOpacity
                    style={[styles.enrollBtn, { backgroundColor: theme.colors.primary }]}
                    onPress={onPress}
                    activeOpacity={0.8}
                >
                    <Text style={styles.enrollBtnText}>Inscribirse</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default function ActivitiesScreen() {
    const navigation = useNavigation<Nav>();
    const { isAdminOrEditor } = useAuthStore();
    const [selectedCat, setSelectedCat] = useState<ActivityCategory | 'Todas'>('Todas');

    const { data: activities, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['activities', selectedCat],
        queryFn: () => activitiesService.getActivities(selectedCat),
    });

    return (
        <SafeAreaView style={styles.container} edges={['top']}>

            {/* ── Header ── */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Actividades</Text>
                    <Text style={styles.headerSub}>Descubre y apúntate</Text>
                </View>
                <TouchableOpacity
                    style={styles.myRegBtn}
                    onPress={() => navigation.navigate('MyRegistrations')}
                >
                    <ClipboardList size={18} color={theme.colors.primary} />
                    <Text style={styles.myRegBtnText}>Las mías</Text>
                </TouchableOpacity>
            </View>

            {/* ── Filtros ── */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}
                style={styles.filterScroll}
            >
                {CATEGORIES.map((cat) => {
                    const active = selectedCat === cat;
                    const color = cat === 'Todas'
                        ? theme.colors.primary
                        : (CATEGORY_COLORS[cat] ?? theme.colors.primary);
                    return (
                        <TouchableOpacity
                            key={cat}
                            style={[
                                styles.filterChip,
                                active && { backgroundColor: color, borderColor: color },
                            ]}
                            onPress={() => setSelectedCat(cat)}
                        >
                            <Text style={[
                                styles.filterChipText,
                                active && styles.filterChipTextActive,
                            ]}>
                                {cat}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {/* ── Lista ── */}
            <FlatList
                data={activities}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={refetch}
                        colors={[theme.colors.primary]}
                        tintColor={theme.colors.primary}
                    />
                }
                renderItem={({ item }) => (
                    <ActivityCard
                        activity={item}
                        onPress={() => navigation.navigate('ActivityDetail', { id: item.id })}
                    />
                )}
                ListEmptyComponent={
                    isLoading ? null : (
                        <EmptyState
                            icon="🗓️"
                            title="Sin actividades"
                            subtitle="No hay actividades en esta categoría por ahora."
                        />
                    )
                }
            />

            {/* ── FAB admin ── */}
            {isAdminOrEditor && (
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() =>
                        (navigation as any).navigate('Perfil', {
                            screen: 'AdminNavigator',
                            params: { screen: 'AdminHome' },
                        })
                    }
                >
                    <Plus color="#fff" size={24} />
                </TouchableOpacity>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.sm,
        paddingBottom: theme.spacing.md,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    headerTitle: {
        ...theme.typography.h2,
        color: theme.colors.text,
    },
    headerSub: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    myRegBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: theme.colors.primary + '15',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: theme.borderRadius.full,
    },
    myRegBtnText: {
        ...theme.typography.label,
        color: theme.colors.primary,
    },

    // Filtros
    filterScroll: {
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        maxHeight: 54,
    },
    filterRow: {
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: 10,
        gap: 8,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: theme.borderRadius.full,
        borderWidth: 1.5,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
    },
    filterChipText: {
        ...theme.typography.label,
        color: theme.colors.textSecondary,
    },
    filterChipTextActive: {
        color: '#fff',
    },

    // Lista
    list: {
        padding: theme.spacing.md,
        paddingBottom: 100,
    },

    // Card
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
    cardMeta: {
        gap: 6,
    },
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
        paddingHorizontal: 22,
        paddingVertical: 9,
        borderRadius: theme.borderRadius.full,
    },
    enrollBtnText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '700',
    },

    // FAB
    fab: {
        position: 'absolute',
        bottom: 28,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...theme.shadow.md,
    },
});
