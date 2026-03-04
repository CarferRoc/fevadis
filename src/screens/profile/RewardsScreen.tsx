import React from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Gift, Lock, RefreshCcw } from 'lucide-react-native';
import { theme } from '../../theme';
import { useRoute } from '@react-navigation/native';
import { ProfileStackParamList } from '../../types/navigation';
import { RouteProp } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { rewardsService } from '../../services/rewardsService';
import { Reward } from '../../types';

type RewardsRouteProp = RouteProp<ProfileStackParamList, 'Rewards'>;

export default function RewardsScreen() {
    const route = useRoute<RewardsRouteProp>();
    const puntos = route.params?.puntos ?? 0;

    const { data: rewards, isLoading } = useQuery({
        queryKey: ['rewards-catalog'],
        queryFn: rewardsService.getAllRewards,
    });

    const handleRedeem = (reward: Reward) => {
        if (puntos < reward.costo_puntos) {
            Alert.alert('Puntos insuficientes', 'No tienes suficientes puntos para canjear esta recompensa.');
            return;
        }
        Alert.alert(
            'Confirmación',
            `¿Quieres canjear "${reward.titulo}" por ${reward.costo_puntos} puntos? \n\n(Nota: función de canje en desarrollo)`,
            [{ text: 'Cancelar', style: 'cancel' }, { text: 'Entendido', style: 'default' }]
        );
    };

    const renderRewardItem = ({ item }: { item: Reward }) => {
        const canAfford = puntos >= item.costo_puntos;

        return (
            <View style={[styles.rewardCard, !canAfford && styles.rewardCardDisabled]}>
                <View style={styles.rewardHeader}>
                    <Text style={styles.rewardTitle}>{item.titulo}</Text>
                    <View style={styles.costBadge}>
                        <Gift size={12} color={canAfford ? theme.colors.accent : theme.colors.textSecondary} />
                        <Text style={[styles.costText, !canAfford && { color: theme.colors.textSecondary }]}>
                            {item.costo_puntos} pts
                        </Text>
                    </View>
                </View>
                {item.descripcion && (
                    <Text style={styles.rewardDesc}>{item.descripcion}</Text>
                )}
                <TouchableOpacity
                    style={[styles.redeemBtn, !canAfford && styles.redeemBtnDisabled]}
                    onPress={() => handleRedeem(item)}
                    activeOpacity={0.8}
                >
                    <Text style={[styles.redeemBtnText, !canAfford && styles.redeemBtnTextDisabled]}>
                        Canjear
                    </Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.heroSection}>
                    <View style={styles.iconWrapper}>
                        <Gift size={48} color={theme.colors.primary} />
                    </View>
                    <Text style={styles.title}>Mis Recompensas</Text>
                    <Text style={styles.pointsLabel}>Puntos Disponibles</Text>
                    <Text style={styles.pointsValue}>{puntos}</Text>
                </View>

                <View style={styles.contentSection}>
                    <Text style={styles.sectionTitle}>Catálogo de Recompensas</Text>

                    {isLoading ? (
                        <Text style={styles.loadingText}>Cargando recompensas...</Text>
                    ) : rewards && rewards.length > 0 ? (
                        <FlatList
                            data={rewards}
                            keyExtractor={i => i.id}
                            renderItem={renderRewardItem}
                            scrollEnabled={false}
                            contentContainerStyle={{ gap: theme.spacing.md }}
                        />
                    ) : (
                        <View style={styles.emptyCard}>
                            <Lock size={32} color={theme.colors.textSecondary} />
                            <Text style={styles.emptyText}>
                                Próximamente añadiremos nuevas recompensas.{'\n'}¡Sigue participando para acumular más puntos!
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scroll: {
        paddingBottom: theme.spacing.xl,
    },
    heroSection: {
        alignItems: 'center',
        paddingVertical: theme.spacing.xxl,
        backgroundColor: theme.colors.primary + '10',
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.primary + '20',
        marginBottom: theme.spacing.xl,
    },
    iconWrapper: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    title: {
        ...theme.typography.h2,
        color: theme.colors.text,
        marginBottom: theme.spacing.md,
    },
    pointsLabel: {
        ...theme.typography.label,
        color: theme.colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    pointsValue: {
        fontSize: 48,
        fontWeight: '800',
        color: theme.colors.primary,
    },
    contentSection: {
        paddingHorizontal: theme.spacing.lg,
    },
    sectionTitle: {
        ...theme.typography.h3,
        color: theme.colors.text,
        marginBottom: theme.spacing.md,
    },
    emptyCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.xl,
        alignItems: 'center',
        gap: theme.spacing.md,
        ...theme.shadow.sm,
    },
    emptyText: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
    },
    loadingText: {
        textAlign: 'center',
        color: theme.colors.textSecondary,
        marginVertical: theme.spacing.xl,
    },
    rewardCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        ...theme.shadow.sm,
    },
    rewardCardDisabled: {
        opacity: 0.8,
    },
    rewardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    rewardTitle: {
        ...theme.typography.h4,
        color: theme.colors.text,
        flex: 1,
        paddingRight: 8,
    },
    costBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: theme.borderRadius.full,
        gap: 4,
    },
    costText: {
        ...theme.typography.label,
        color: theme.colors.accent,
    },
    rewardDesc: {
        ...theme.typography.bodySmall,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.md,
    },
    redeemBtn: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 10,
        borderRadius: theme.borderRadius.sm,
        alignItems: 'center',
    },
    redeemBtnDisabled: {
        backgroundColor: theme.colors.border,
    },
    redeemBtnText: {
        ...theme.typography.button,
        color: '#fff',
    },
    redeemBtnTextDisabled: {
        color: theme.colors.textSecondary,
    }
});
