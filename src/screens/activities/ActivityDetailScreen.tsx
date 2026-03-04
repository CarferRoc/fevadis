import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    TouchableOpacity,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { ActivitiesStackParamList } from '../../types/navigation';
import { activitiesService } from '../../services/activitiesService';
import { registrationsService } from '../../services/registrationsService';
import { Button } from '../../components/Button';
import { StatusBadge } from '../../components/StatusBadge';
import { EmptyState } from '../../components/EmptyState';
import { theme } from '../../theme';
import { useAuthStore } from '../../store/useAuthStore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    Calendar,
    MapPin,
    Users,
    ArrowLeft,
    Clock,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Route = RouteProp<ActivitiesStackParamList, 'ActivityDetail'>;

export default function ActivityDetailScreen() {
    const route = useRoute<Route>();
    const navigation = useNavigation();
    const { id } = route.params;
    const { user, profile, isAdminOrEditor } = useAuthStore();
    const queryClient = useQueryClient();
    const [enrolling, setEnrolling] = useState(false);

    const { data: activity, isLoading: loadingActivity } = useQuery({
        queryKey: ['activity', id],
        queryFn: () => activitiesService.getActivityById(id),
    });

    const { data: registration, refetch: refetchReg } = useQuery({
        queryKey: ['my-registration', id, user?.id],
        queryFn: () =>
            user
                ? registrationsService.getMyRegistrationForActivity(user.id, id)
                : null,
        enabled: !!user,
    });

    async function handleEnroll() {
        if (!user) return;
        setEnrolling(true);
        try {
            await registrationsService.createRegistration(id, user.id);
            await refetchReg();
            Alert.alert('✅ Inscripción enviada', 'Tu solicitud está pendiente de aprobación.');
        } catch (e: any) {
            Alert.alert('Error', e.message);
        } finally {
            setEnrolling(false);
        }
    }

    if (loadingActivity || !activity) {
        return (
            <SafeAreaView style={styles.centered}>
                <Text style={styles.loading}>Cargando...</Text>
            </SafeAreaView>
        );
    }

    const startDate = new Date(activity.fecha_inicio);
    const endDate = new Date(activity.fecha_fin);
    const isPast = endDate < new Date();

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <ScrollView contentContainerStyle={styles.scroll}>
                {/* Hero */}
                <View style={styles.hero}>
                    <View style={styles.catPill}>
                        <Text style={styles.catText}>{activity.categoria}</Text>
                    </View>
                    <Text style={styles.title}>{activity.titulo}</Text>
                </View>

                {/* Info rows */}
                <View style={styles.section}>
                    <InfoRow icon={<Calendar size={18} color={theme.colors.primary} />}
                        text={format(startDate, "EEEE d MMMM yyyy, HH:mm", { locale: es })}
                        label="Inicio"
                    />
                    <InfoRow icon={<Clock size={18} color={theme.colors.primary} />}
                        text={format(endDate, "EEEE d MMMM yyyy, HH:mm", { locale: es })}
                        label="Fin"
                    />
                    {activity.ubicacion && (
                        <InfoRow icon={<MapPin size={18} color={theme.colors.primary} />}
                            text={activity.ubicacion}
                            label="Ubicación"
                        />
                    )}
                    <InfoRow icon={<Users size={18} color={theme.colors.primary} />}
                        text={`${activity.plazas} plazas`}
                        label="Plazas"
                    />
                </View>

                {/* Description */}
                {activity.descripcion && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Descripción</Text>
                        <Text style={styles.description}>{activity.descripcion}</Text>
                    </View>
                )}

                {/* Action */}
                <View style={styles.section}>
                    {isPast ? (
                        <View style={styles.pastBanner}>
                            <Text style={styles.pastText}>Esta actividad ya ha finalizado</Text>
                        </View>
                    ) : registration ? (
                        <View style={styles.statusBox}>
                            <Text style={styles.statusLabel}>Tu estado de inscripción</Text>
                            <StatusBadge status={registration.status} />
                            {registration.attendance !== 'pendiente' && (
                                <Text style={styles.attendanceInfo}>
                                    Asistencia: {registration.attendance === 'asistio' ? 'Asististe ✓' : 'No asististe'}
                                </Text>
                            )}
                        </View>
                    ) : (
                        <Button
                            title="Apuntarme a esta actividad"
                            onPress={handleEnroll}
                            loading={enrolling}
                            size="lg"
                        />
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function InfoRow({
    icon,
    text,
    label,
}: {
    icon: React.ReactNode;
    text: string;
    label: string;
}) {
    return (
        <View style={styles.infoRow}>
            {icon}
            <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoText}>{text}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loading: { ...theme.typography.body, color: theme.colors.textSecondary },
    scroll: { paddingBottom: 40 },
    hero: {
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.lg,
        paddingTop: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    catPill: {
        backgroundColor: theme.colors.primaryLight + '20',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: theme.borderRadius.full,
        alignSelf: 'flex-start',
        marginBottom: theme.spacing.sm,
    },
    catText: {
        ...theme.typography.caption,
        fontWeight: '700',
        color: theme.colors.primary,
        textTransform: 'uppercase',
    },
    title: { ...theme.typography.h1, color: theme.colors.text, fontSize: 26 },
    section: {
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.lg,
        marginTop: 8,
        gap: theme.spacing.md,
    },
    sectionTitle: { ...theme.typography.h3, color: theme.colors.text },
    description: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        lineHeight: 24,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    infoLabel: { ...theme.typography.caption, color: theme.colors.textSecondary },
    infoText: { ...theme.typography.body, color: theme.colors.text },
    statusBox: {
        gap: theme.spacing.sm,
        padding: theme.spacing.md,
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.md,
    },
    statusLabel: { ...theme.typography.label, color: theme.colors.textSecondary },
    attendanceInfo: { ...theme.typography.bodySmall, color: theme.colors.text, marginTop: 4 },
    pastBanner: {
        backgroundColor: '#F3F4F6',
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
    },
    pastText: { ...theme.typography.body, color: theme.colors.textSecondary },
});
