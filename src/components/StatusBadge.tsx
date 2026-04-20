import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';
import { RegistrationStatus, AttendanceStatus } from '../types';

const REGISTRATION_CONFIG: Record<
    RegistrationStatus,
    { label: string; bg: string; text: string; dot: string }
> = {
    pendiente: { label: 'Pendiente', bg: theme.colors.statusPending, text: theme.colors.statusPendingText, dot: '#D19B16' },
    aceptado: { label: 'Aceptado', bg: theme.colors.statusAccepted, text: theme.colors.statusAcceptedText, dot: '#4C9A2A' },
    rechazado: { label: 'Rechazado', bg: theme.colors.statusRejected, text: theme.colors.statusRejectedText, dot: '#C94646' },
    lista_espera: { label: 'Lista Espera', bg: theme.colors.statusWaiting, text: theme.colors.statusWaitingText, dot: '#7266C4' },
};

interface StatusBadgeProps {
    status: RegistrationStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
    const c = REGISTRATION_CONFIG[status];
    return (
        <View style={[styles.badge, { backgroundColor: c.bg }]}>
            <View style={[styles.dot, { backgroundColor: c.dot }]} />
            <Text style={[styles.text, { color: c.text }]}>{c.label}</Text>
        </View>
    );
}

const ATTENDANCE_CONFIG: Record<
    AttendanceStatus,
    { label: string; bg: string; text: string; dot: string }
> = {
    pendiente: { label: 'Sin marcar', bg: theme.colors.surfaceMuted, text: theme.colors.textSecondary, dot: theme.colors.textTertiary },
    asistio: { label: 'Asistió', bg: theme.colors.successSoft, text: theme.colors.success, dot: theme.colors.success },
    no_asistio: { label: 'No asistió', bg: theme.colors.errorSoft, text: theme.colors.error, dot: theme.colors.error },
};

interface AttendanceBadgeProps {
    attendance: AttendanceStatus;
}

export function AttendanceBadge({ attendance }: AttendanceBadgeProps) {
    const c = ATTENDANCE_CONFIG[attendance];
    return (
        <View style={[styles.badge, { backgroundColor: c.bg }]}>
            <View style={[styles.dot, { backgroundColor: c.dot }]} />
            <Text style={[styles.text, { color: c.text }]}>{c.label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: theme.radius.pill,
        alignSelf: 'flex-start',
        gap: 5,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    text: {
        fontSize: 11,
        fontWeight: '700',
    },
});
