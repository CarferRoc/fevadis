export const theme = {
    colors: {
        primary: '#22C55E',       // Green 500 – vibrante y fresco
        primaryLight: '#86EFAC',  // Green 300
        primaryDark: '#16A34A',   // Green 600
        secondary: '#059669',     // Emerald 600
        accent: '#F59E0B',        // Amber 500
        background: '#F2F4F7',    // Fondo gris muy suave
        surface: '#FFFFFF',
        surfaceAlt: '#F8FAFC',
        text: '#111827',          // Casi negro
        textSecondary: '#6B7280', // Gris medio
        textTertiary: '#9CA3AF',  // Gris claro
        error: '#EF4444',
        success: '#22C55E',
        warning: '#F59E0B',
        border: '#E5E7EB',
        borderFocus: '#22C55E',
        // Role colors
        roleAdmin: '#7C3AED',
        roleEditor: '#F59E0B',
        roleVoluntario: '#22C55E',
        // Status colors
        statusPending: '#FEF9C3',
        statusPendingText: '#854D0E',
        statusAccepted: '#DCFCE7',
        statusAcceptedText: '#166534',
        statusRejected: '#FEE2E2',
        statusRejectedText: '#991B1B',
        statusWaiting: '#EDE9FE',
        statusWaitingText: '#5B21B6',
        // Category colors
        catOcio: '#3B82F6',        // Blue 500
        catCampamentos: '#F97316', // Orange 500
        catFormaciones: '#8B5CF6', // Violet 500
        catTalleres: '#EC4899',    // Pink 500
    },
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48,
    },
    borderRadius: {
        sm: 8,
        md: 12,
        lg: 16,
        xl: 22,
        full: 9999,
    },
    typography: {
        h1: { fontSize: 30, fontWeight: '800' as const, letterSpacing: -0.5 },
        h2: { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.3 },
        h3: { fontSize: 20, fontWeight: '700' as const },
        h4: { fontSize: 16, fontWeight: '600' as const },
        body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
        bodySmall: { fontSize: 13, fontWeight: '400' as const, lineHeight: 19 },
        caption: { fontSize: 12, fontWeight: '400' as const },
        label: { fontSize: 13, fontWeight: '600' as const, letterSpacing: 0.2 },
        button: { fontSize: 15, fontWeight: '700' as const },
    },
    shadow: {
        xs: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.03,
            shadowRadius: 2,
            elevation: 1,
        },
        sm: {
            shadowColor: '#1F2937',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 6,
            elevation: 3,
        },
        md: {
            shadowColor: '#1F2937',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 6,
        },
    },
} as const;
