import { theme } from '../theme';
import type { RegistrationStatus, AttendanceStatus } from '../types';

const REGISTRATION_CONFIG: Record<
    RegistrationStatus,
    { label: string; bg: string; text: string; dot: string }
> = {
    pendiente: { label: 'Pendiente', bg: theme.colors.statusPending, text: theme.colors.statusPendingText, dot: '#D19B16' },
    aceptado: { label: 'Aceptado', bg: theme.colors.statusAccepted, text: theme.colors.statusAcceptedText, dot: '#4C9A2A' },
    rechazado: { label: 'Rechazado', bg: theme.colors.statusRejected, text: theme.colors.statusRejectedText, dot: '#C94646' },
    lista_espera: { label: 'Lista Espera', bg: theme.colors.statusWaiting, text: theme.colors.statusWaitingText, dot: '#7266C4' },
};

const badgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    paddingLeft: 8,
    paddingRight: 8,
    paddingTop: 3,
    paddingBottom: 3,
    borderRadius: 9999,
    gap: 5,
    alignSelf: 'flex-start',
};

const dotStyle: React.CSSProperties = { width: 6, height: 6, borderRadius: 3 };
const textStyle: React.CSSProperties = { fontSize: 11, fontWeight: 700 };

export function StatusBadge({ status }: { status: RegistrationStatus }) {
    const c = REGISTRATION_CONFIG[status];
    return (
        <span style={{ ...badgeStyle, backgroundColor: c.bg }}>
            <span style={{ ...dotStyle, backgroundColor: c.dot }} />
            <span style={{ ...textStyle, color: c.text }}>{c.label}</span>
        </span>
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

export function AttendanceBadge({ attendance }: { attendance: AttendanceStatus }) {
    const c = ATTENDANCE_CONFIG[attendance];
    return (
        <span style={{ ...badgeStyle, backgroundColor: c.bg }}>
            <span style={{ ...dotStyle, backgroundColor: c.dot }} />
            <span style={{ ...textStyle, color: c.text }}>{c.label}</span>
        </span>
    );
}
