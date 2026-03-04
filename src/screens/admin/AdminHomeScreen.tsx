import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../types/navigation';
import { theme } from '../../theme';
import { useAuthStore } from '../../store/useAuthStore';

type Nav = NativeStackNavigationProp<AdminStackParamList, 'AdminHome'>;

const CARDS = [
    {
        key: 'AdminActivities' as keyof AdminStackParamList,
        icon: '🗓️',
        title: 'Actividades',
        subtitle: 'Crear, editar y eliminar',
        color: '#EEF2FF',
        border: theme.colors.primary,
    },
    {
        key: 'AdminRegistrations' as keyof AdminStackParamList,
        icon: '📋',
        title: 'Inscripciones',
        subtitle: 'Aceptar y marcar asistencia',
        color: '#ECFDF5',
        border: theme.colors.secondary,
    },
    {
        key: 'AdminUsers' as keyof AdminStackParamList,
        icon: '👥',
        title: 'Usuarios',
        subtitle: 'Ver y gestionar roles',
        color: '#FFFBEB',
        border: theme.colors.warning,
    },
    {
        key: 'AdminAuthorizedDnis' as keyof AdminStackParamList,
        icon: '🪪',
        title: 'DNIs Autorizados',
        subtitle: 'Alta, baja y revocación',
        color: '#FFF1F2',
        border: theme.colors.error,
    },
    {
        key: 'AdminCertificates' as keyof AdminStackParamList,
        icon: '🏅',
        title: 'Certificados',
        subtitle: 'Por actividad y asistente',
        color: '#ECFDF5',
        border: theme.colors.catFormaciones,
    },
    {
        key: 'AdminRewards' as keyof AdminStackParamList,
        icon: '🎁',
        title: 'Recompensas',
        subtitle: 'Gestión de catálogo',
        color: '#FDF2F8',
        border: theme.colors.catTalleres,
    },
    {
        key: 'AdminGroupChats' as keyof AdminStackParamList,
        icon: '💬',
        title: 'Grupos de Chat',
        subtitle: 'Comunicaciones masivas',
        color: '#EFF6FF',
        border: theme.colors.primary,
    }
];

export default function AdminHomeScreen() {
    const navigation = useNavigation<Nav>();
    const { profile } = useAuthStore();

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.welcomeBox}>
                <Text style={styles.welcomeTitle}>Panel de Administración</Text>
                <Text style={styles.welcomeSub}>
                    Bienvenido/a, {profile?.nombre}. Rol: {profile?.role?.toUpperCase()}
                </Text>
            </View>

            <View style={styles.grid}>
                {CARDS.map((card) => (
                    <TouchableOpacity
                        key={card.key}
                        style={[styles.card, { backgroundColor: card.color, borderLeftColor: card.border }]}
                        onPress={() => navigation.navigate(card.key as any)}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.cardIcon}>{card.icon}</Text>
                        <Text style={styles.cardTitle}>{card.title}</Text>
                        <Text style={styles.cardSub}>{card.subtitle}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl },
    welcomeBox: {
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.lg,
        ...theme.shadow.md,
    },
    welcomeTitle: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 4 },
    welcomeSub: { ...theme.typography.bodySmall, color: 'rgba(255,255,255,0.8)' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md },
    card: {
        width: '47%',
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        borderLeftWidth: 4,
        ...theme.shadow.sm,
        gap: 6,
    },
    cardIcon: { fontSize: 32 },
    cardTitle: { ...theme.typography.h4, color: theme.colors.text },
    cardSub: { ...theme.typography.bodySmall, color: theme.colors.textSecondary },
});
