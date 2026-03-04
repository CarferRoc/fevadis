import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';
import { RegistrationStatus, AttendanceStatus } from '../types';

// ─── Registration Status Badge ────────────────────────────────────────────────
const REGISTRATION_CONFIG: Record<
    RegistrationStatus,
    { label: string; bg: string; text: string }
> = {
    pendiente: { label: 'Pendiente', bg: theme.colors.statusPending, text: theme.colors.statusPendingText },
    aceptado: { label: 'Aceptado', bg: theme.colors.statusAccepted, text: theme.colors.statusAcceptedText },
    rechazado: { label: 'Rechazado', bg: theme.colors.statusRejected, text: theme.colors.statusRejectedText },
    lista_espera: { label: 'Lista Espera', bg: theme.colors.statusWaiting, text: theme.colors.statusWaitingText },
};

interface StatusBadgeProps {
    status: RegistrationStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
    const config = REGISTRATION_CONFIG[status];
    return (
        <View style={[styles.badge, { backgroundColor: config.bg }]}>
            <Text style={[styles.text, { color: config.text }]}>{config.label}</Text>
        </View>
    );
}

// ─── Attendance Status Badge ──────────────────────────────────────────────────
const ATTENDANCE_CONFIG: Record<
    AttendanceStatus,
    { label: string; bg: string; text: string }
> = {
    pendiente: { label: 'Sin marcar', bg: '#F3F4F6', text: '#374151' },
    asistio: { label: 'Asistió ✓', bg: theme.colors.statusAccepted, text: theme.colors.statusAcceptedText },
    no_asistio: { label: 'No asistió', bg: theme.colors.statusRejected, text: theme.colors.statusRejectedText },
};

interface AttendanceBadgeProps {
    attendance: AttendanceStatus;
}

export function AttendanceBadge({ attendance }: AttendanceBadgeProps) {
    const config = ATTENDANCE_CONFIG[attendance];
    return (
        <View style={[styles.badge, { backgroundColor: config.bg }]}>
            <Text style={[styles.text, { color: config.text }]}>{config.label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: theme.borderRadius.full,
        alignSelf: 'flex-start',
    },
    text: {
        fontSize: 12,
        fontWeight: '600',
    },
});
