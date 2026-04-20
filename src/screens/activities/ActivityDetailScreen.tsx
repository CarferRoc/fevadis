import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    Pressable,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { ActivitiesStackParamList } from '../../types/navigation';
import { activitiesService } from '../../services/activitiesService';
import { registrationsService } from '../../services/registrationsService';
import { Button } from '../../components/Button';
import { StatusBadge } from '../../components/StatusBadge';
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
    CheckCircle2,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Route = RouteProp<ActivitiesStackParamList, 'ActivityDetail'>;

const CAT_COLORS: Record<string, { bg: string; fg: string }> = {
    Ocio: { bg: theme.colors.catOcioSoft, fg: theme.colors.catOcio },
    Campamentos: { bg: theme.colors.catCampamentosSoft, fg: theme.colors.catCampamentos },
    Formaciones: { bg: theme.colors.catFormacionesSoft, fg: theme.colors.catFormaciones },
    Talleres: { bg: theme.colors.catTalleresSoft, fg: theme.colors.catTalleres },
};

export default function ActivityDetailScreen() {
    const route = useRoute<Route>();
    const navigation = useNavigation();
    const { id } = route.params;
    const { user } = useAuthStore();
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
            Alert.alert('Inscripción enviada', 'Tu solicitud está pendiente de aprobación.');
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
    const cat = CAT_COLORS[activity.categoria] ?? { bg: theme.colors.primaryLight, fg: theme.colors.primaryDark };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.hero}>
                    <Pressable
                        style={styles.backBtn}
                        onPress={() => navigation.goBack()}
                    >
                        <ArrowLeft size={18} color={theme.colors.text} />
                    </Pressable>
                    <View style={[styles.catPill, { backgroundColor: cat.bg }]}>
                        <Text style={[styles.catText, { color: cat.fg }]}>
                            {activity.categoria}
                        </Text>
                    </View>
                    <Text style={styles.title}>{activity.titulo}</Text>
                </View>

                <View style={styles.infoCard}>
                    <InfoRow
                        icon={<Calendar size={16} color={theme.colors.primaryDark} />}
                        label="Inicio"
                        text={format(startDate, "EEEE d 'de' MMMM", { locale: es })}
                        sub={format(startDate, "HH:mm 'h'", { locale: es })}
                    />
                    <Divider />
                    <InfoRow
                        icon={<Clock size={16} color={theme.colors.primaryDark} />}
                        label="Fin"
                        text={format(endDate, "EEEE d 'de' MMMM", { locale: es })}
                        sub={format(endDate, "HH:mm 'h'", { locale: es })}
                    />
                    {activity.ubicacion && (
                        <>
                            <Divider />
                            <InfoRow
                                icon={<MapPin size={16} color={theme.colors.primaryDark} />}
                                label="Ubicación"
                                text={activity.ubicacion}
                            />
                        </>
                    )}
                    <Divider />
                    <InfoRow
                        icon={<Users size={16} color={theme.colors.primaryDark} />}
                        label="Plazas"
                        text={`${activity.plazas} plazas disponibles`}
                    />
                </View>

                {activity.descripcion && (
                    <View style={styles.block}>
                        <Text style={styles.blockTitle}>Descripción</Text>
                        <Text style={styles.description}>{activity.descripcion}</Text>
                    </View>
                )}

                <View style={{ paddingHorizontal: 18, marginTop: 8 }}>
                    {isPast ? (
                        <View style={styles.pastBanner}>
                            <Text style={styles.pastText}>Esta actividad ya ha finalizado</Text>
                        </View>
                    ) : registration ? (
                        <View style={styles.statusBox}>
                            <View style={styles.statusHead}>
                                <CheckCircle2 size={18} color={theme.colors.primaryDark} />
                                <Text style={styles.statusTitle}>Ya estás inscrito</Text>
                            </View>
                            <View style={styles.statusRow}>
                                <Text style={styles.statusLabel}>Inscripción</Text>
                                <StatusBadge status={registration.status} />
                            </View>
                            {registration.attendance !== 'pendiente' && (
                                <View style={styles.statusRow}>
                                    <Text style={styles.statusLabel}>Asistencia</Text>
                                    <Text style={styles.attendanceInfo}>
                                        {registration.attendance === 'asistio' ? 'Asististe ✓' : 'No asististe'}
                                    </Text>
                                </View>
                            )}
                        </View>
                    ) : (
                        <Button
                            title="Apuntarme a esta actividad"
                            onPress={handleEnroll}
                            loading={enrolling}
                            size="lg"
                            fullWidth
                        />
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function InfoRow({
    icon,
    label,
    text,
    sub,
}: {
    icon: React.ReactNode;
    label: string;
    text: string;
    sub?: string;
}) {
    return (
        <View style={styles.infoRow}>
            <View style={styles.infoIcon}>{icon}</View>
            <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoText}>{text}</Text>
                {sub ? <Text style={styles.infoSub}>{sub}</Text> : null}
            </View>
        </View>
    );
}

function Divider() {
    return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loading: { ...theme.typography.body, color: theme.colors.textSecondary },
    scroll: { paddingBottom: 40 },

    hero: {
        paddingHorizontal: 18,
        paddingTop: 8,
        paddingBottom: 20,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: theme.colors.surfaceAlt,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 14,
    },
    catPill: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: theme.radius.pill,
        alignSelf: 'flex-start',
        marginBottom: 10,
    },
    catText: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.4,
    },
    title: {
        ...theme.typography.h1,
        color: theme.colors.text,
        lineHeight: 30,
    },
    infoCard: {
        backgroundColor: theme.colors.surface,
        marginHorizontal: 14,
        marginTop: 14,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: 4,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        padding: 12,
    },
    infoIcon: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: theme.colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 2,
    },
    infoLabel: {
        ...theme.typography.caption,
        color: theme.colors.textTertiary,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    infoText: {
        ...theme.typography.bodyStrong,
        color: theme.colors.text,
        marginTop: 2,
    },
    infoSub: {
        ...theme.typography.bodySmall,
        color: theme.colors.textSecondary,
        marginTop: 1,
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginHorizontal: 12,
    },
    block: {
        marginHorizontal: 14,
        marginTop: 14,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: 16,
    },
    blockTitle: {
        ...theme.typography.h4,
        color: theme.colors.text,
        marginBottom: 6,
    },
    description: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        lineHeight: 22,
    },

    statusBox: {
        backgroundColor: theme.colors.primarySoft,
        borderRadius: theme.radius.lg,
        padding: 14,
        gap: 8,
        borderWidth: 1,
        borderColor: theme.colors.primaryLight,
    },
    statusHead: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    statusTitle: {
        ...theme.typography.h4,
        color: theme.colors.primaryDarker,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusLabel: {
        ...theme.typography.bodySmall,
        color: theme.colors.textSecondary,
        fontWeight: '600',
    },
    attendanceInfo: {
        ...theme.typography.bodyStrong,
        color: theme.colors.text,
    },
    pastBanner: {
        backgroundColor: theme.colors.surfaceMuted,
        padding: 14,
        borderRadius: theme.radius.lg,
        alignItems: 'center',
    },
    pastText: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        fontWeight: '600',
    },
});
