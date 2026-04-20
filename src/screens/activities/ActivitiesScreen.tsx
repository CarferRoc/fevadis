import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    TouchableOpacity,
    ScrollView,
    Pressable,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { activitiesService } from '../../services/activitiesService';
import { theme } from '../../theme';
import { useAuthStore } from '../../store/useAuthStore';
import { ActivitiesStackParamList } from '../../types/navigation';
import { ActivityCategory } from '../../types';
import { EmptyState } from '../../components/EmptyState';
import { ActivityCard } from '../../components/ActivityCard';
import { Logo } from '../../components/Logo';
import { ClipboardList, Plus } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Nav = NativeStackNavigationProp<ActivitiesStackParamList, 'ActivitiesList'>;

const CATEGORIES: (ActivityCategory | 'Todas')[] = [
    'Todas', 'Ocio', 'Campamentos', 'Formaciones', 'Talleres',
];

export default function ActivitiesScreen() {
    const navigation = useNavigation<Nav>();
    const { isAdminOrEditor, profile } = useAuthStore();
    const [selectedCat, setSelectedCat] = useState<ActivityCategory | 'Todas'>('Todas');

    const { data: activities, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['activities', selectedCat],
        queryFn: () => activitiesService.getActivities(selectedCat),
    });

    const greet =
        profile?.nombre ? `Hola, ${profile.nombre}` : 'Bienvenid@';

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <View style={styles.brandRow}>
                    <Logo size={28} />
                    <Text style={styles.brand}>fevadis</Text>
                </View>
                <Pressable
                    style={({ pressed }) => [styles.myRegBtn, pressed && { opacity: 0.7 }]}
                    onPress={() => navigation.navigate('MyRegistrations')}
                >
                    <ClipboardList size={14} color={theme.colors.primaryDark} />
                    <Text style={styles.myRegText}>Las mías</Text>
                </Pressable>
            </View>

            <View style={styles.hello}>
                <Text style={styles.helloGreeting}>{greet}</Text>
                <Text style={styles.helloTitle}>Actividades</Text>
                <Text style={styles.helloSub}>Descubre y apúntate a lo que viene</Text>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}
                style={styles.filterScroll}
            >
                {CATEGORIES.map((cat) => {
                    const active = selectedCat === cat;
                    return (
                        <Pressable
                            key={cat}
                            style={[styles.chip, active && styles.chipActive]}
                            onPress={() => setSelectedCat(cat)}
                        >
                            <Text style={[styles.chipText, active && styles.chipTextActive]}>
                                {cat}
                            </Text>
                        </Pressable>
                    );
                })}
            </ScrollView>

            <FlatList
                data={activities}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={refetch}
                        tintColor={theme.colors.primary}
                        colors={[theme.colors.primary]}
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

            {isAdminOrEditor && (
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() =>
                        (navigation as any).navigate('Perfil', {
                            screen: 'AdminNavigator',
                            params: { screen: 'AdminHome' },
                        })
                    }
                    activeOpacity={0.88}
                >
                    <Plus color="#fff" size={22} strokeWidth={2.6} />
                </TouchableOpacity>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingTop: 8,
        paddingBottom: 12,
    },
    brandRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    brand: {
        fontSize: 17,
        fontWeight: '800',
        color: theme.colors.text,
        letterSpacing: -0.3,
    },
    myRegBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: theme.colors.primaryLight,
        paddingHorizontal: 11,
        paddingVertical: 6,
        borderRadius: theme.radius.pill,
    },
    myRegText: {
        fontSize: 12,
        fontWeight: '700',
        color: theme.colors.primaryDark,
    },

    hello: {
        paddingHorizontal: 18,
        paddingBottom: 14,
    },
    helloGreeting: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
        fontWeight: '600',
    },
    helloTitle: {
        ...theme.typography.display,
        color: theme.colors.text,
        marginTop: 2,
    },
    helloSub: {
        ...theme.typography.bodySmall,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },

    filterScroll: {
        maxHeight: 46,
    },
    filterRow: {
        paddingHorizontal: 18,
        paddingVertical: 6,
        gap: 6,
    },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: theme.radius.pill,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    chipActive: {
        backgroundColor: theme.colors.text,
        borderColor: theme.colors.text,
    },
    chipText: {
        fontSize: 12.5,
        fontWeight: '600',
        color: theme.colors.textSecondary,
    },
    chipTextActive: {
        color: '#fff',
    },

    list: {
        paddingHorizontal: 18,
        paddingTop: 10,
        paddingBottom: 100,
    },

    fab: {
        position: 'absolute',
        bottom: 22,
        right: 20,
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...theme.shadow.md,
    },
});
