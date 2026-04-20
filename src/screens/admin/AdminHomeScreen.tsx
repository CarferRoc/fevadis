import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../types/navigation';
import { theme } from '../../theme';
import { useAuthStore } from '../../store/useAuthStore';
import {
    CalendarDays,
    ClipboardCheck,
    Users,
    IdCard,
    Award,
    Gift,
    MessagesSquare,
    ChevronRight,
    Shield,
    FileText,
} from 'lucide-react-native';

type Nav = NativeStackNavigationProp<AdminStackParamList, 'AdminHome'>;

const CARDS = [
    {
        key: 'AdminActivities' as keyof AdminStackParamList,
        icon: CalendarDays,
        title: 'Actividades',
        subtitle: 'Crear, editar y eliminar',
        tint: theme.colors.catOcio,
        tintBg: theme.colors.catOcioSoft,
    },
    {
        key: 'AdminRegistrations' as keyof AdminStackParamList,
        icon: ClipboardCheck,
        title: 'Inscripciones',
        subtitle: 'Aceptar y marcar asistencia',
        tint: theme.colors.primaryDark,
        tintBg: theme.colors.primaryLight,
    },
    {
        key: 'AdminUsers' as keyof AdminStackParamList,
        icon: Users,
        title: 'Usuarios',
        subtitle: 'Ver y gestionar roles',
        tint: theme.colors.warning,
        tintBg: theme.colors.warningSoft,
    },
    {
        key: 'AdminAuthorizedDnis' as keyof AdminStackParamList,
        icon: IdCard,
        title: 'DNIs autorizados',
        subtitle: 'Alta, baja y revocación',
        tint: theme.colors.error,
        tintBg: theme.colors.errorSoft,
    },
    {
        key: 'AdminCertificates' as keyof AdminStackParamList,
        icon: Award,
        title: 'Certificados',
        subtitle: 'Por actividad y asistente',
        tint: theme.colors.catFormaciones,
        tintBg: theme.colors.catFormacionesSoft,
    },
    {
        key: 'AdminRewards' as keyof AdminStackParamList,
        icon: Gift,
        title: 'Recompensas',
        subtitle: 'Gestión de catálogo',
        tint: theme.colors.catTalleres,
        tintBg: theme.colors.catTalleresSoft,
    },
    {
        key: 'AdminGroupChats' as keyof AdminStackParamList,
        icon: MessagesSquare,
        title: 'Grupos de chat',
        subtitle: 'Comunicaciones masivas',
        tint: theme.colors.catCampamentos,
        tintBg: theme.colors.catCampamentosSoft,
    },
    {
        key: 'AdminInfo' as keyof AdminStackParamList,
        icon: FileText,
        title: 'Información',
        subtitle: 'Subir archivos para voluntarios',
        tint: theme.colors.primaryDark,
        tintBg: theme.colors.primaryLight,
    },
];

export default function AdminHomeScreen() {
    const navigation = useNavigation<Nav>();
    const { profile } = useAuthStore();

    return (
        <ScrollView
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.welcomeBox}>
                <View style={styles.welcomeIcon}>
                    <Shield size={18} color="#fff" strokeWidth={2.2} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.welcomeTitle}>Panel de administración</Text>
                    <Text style={styles.welcomeSub}>
                        {profile?.nombre} · {profile?.role?.toUpperCase()}
                    </Text>
                </View>
            </View>

            <Text style={styles.sectionLabel}>GESTIÓN</Text>
            <View style={styles.list}>
                {CARDS.map((card, idx) => (
                    <React.Fragment key={card.key}>
                        <Pressable
                            style={({ pressed }) => [
                                styles.row,
                                pressed && { backgroundColor: theme.colors.primarySoft },
                            ]}
                            onPress={() => navigation.navigate(card.key as any)}
                        >
                            <View style={[styles.rowIcon, { backgroundColor: card.tintBg }]}>
                                <card.icon size={18} color={card.tint} strokeWidth={2.2} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.rowTitle}>{card.title}</Text>
                                <Text style={styles.rowSub}>{card.subtitle}</Text>
                            </View>
                            <ChevronRight size={16} color={theme.colors.textTertiary} />
                        </Pressable>
                        {idx < CARDS.length - 1 && <View style={styles.divider} />}
                    </React.Fragment>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        paddingBottom: 40,
    },
    welcomeBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: theme.colors.primary,
        borderRadius: theme.radius.xl,
        padding: 18,
        marginBottom: 18,
        ...theme.shadow.sm,
    },
    welcomeIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    welcomeTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: '#fff',
    },
    welcomeSub: {
        fontSize: 12,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.85)',
        marginTop: 2,
        letterSpacing: 0.3,
    },
    sectionLabel: {
        ...theme.typography.overline,
        color: theme.colors.textTertiary,
        marginBottom: 6,
        marginLeft: 4,
    },
    list: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: 4,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: theme.radius.md,
    },
    rowIcon: {
        width: 38,
        height: 38,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rowTitle: {
        ...theme.typography.bodyStrong,
        color: theme.colors.text,
    },
    rowSub: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        marginTop: 1,
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginHorizontal: 12,
    },
});
