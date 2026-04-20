export const theme = {
    colors: {
        // Brand — verde del logo
        primary: '#7AB13D',
        primaryDark: '#5F8E2D',
        primaryDarker: '#4A6F22',
        primaryLight: '#E8F2D3',
        primarySoft: '#F3F8E8',
        primarySurface: '#FBFDF6',

        // Acento
        accent: '#F59E0B',
        accentSoft: '#FEF3C7',

        // Retrocompat
        secondary: '#14201A',

        // Neutros
        background: '#FAFBF7',
        surface: '#FFFFFF',
        surfaceAlt: '#F5F7F0',
        surfaceMuted: '#EEF2E7',

        // Texto
        text: '#14201A',
        textSecondary: '#5C6B62',
        textTertiary: '#9AA89F',
        textInverse: '#FFFFFF',

        // Semántico
        error: '#E04F4F',
        errorSoft: '#FDECEC',
        success: '#4C9A2A',
        successSoft: '#E5F3D9',
        warning: '#E89B15',
        warningSoft: '#FEF2DC',
        info: '#3E7CB1',
        infoSoft: '#E4EEF7',

        // Bordes
        border: '#E5EBDE',
        borderStrong: '#D4DBCB',
        borderFocus: '#7AB13D',

        // Roles
        roleAdmin: '#6D53C5',
        roleAdminSoft: '#EDE8FB',
        roleEditor: '#D48712',
        roleEditorSoft: '#FDF1D9',
        roleVoluntario: '#4C9A2A',
        roleVoluntarioSoft: '#E5F3D9',

        // Estados de inscripción
        statusPending: '#FEF4D6',
        statusPendingText: '#8A6410',
        statusAccepted: '#DEF0CB',
        statusAcceptedText: '#3E7A1A',
        statusRejected: '#FBDCDC',
        statusRejectedText: '#A62F2F',
        statusWaiting: '#E4E4F8',
        statusWaitingText: '#4E4696',

        // Categorías de actividad
        catOcio: '#3E7CB1',
        catOcioSoft: '#E4EEF7',
        catCampamentos: '#E87322',
        catCampamentosSoft: '#FCE5D3',
        catFormaciones: '#7A52B4',
        catFormacionesSoft: '#EBE3F7',
        catTalleres: '#D64C8A',
        catTalleresSoft: '#FBE0EC',
    },
    spacing: {
        xxs: 2,
        xs: 4,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 24,
        xxl: 32,
        xxxl: 48,
    },
    radius: {
        xs: 6,
        sm: 8,
        md: 10,
        lg: 14,
        xl: 20,
        pill: 9999,
    },
    typography: {
        display: { fontSize: 30, fontWeight: 800, letterSpacing: -0.6, lineHeight: 36 },
        h1: { fontSize: 24, fontWeight: 800, letterSpacing: -0.4, lineHeight: 30 },
        h2: { fontSize: 20, fontWeight: 700, letterSpacing: -0.2, lineHeight: 26 },
        h3: { fontSize: 17, fontWeight: 700, lineHeight: 22 },
        h4: { fontSize: 15, fontWeight: 700, lineHeight: 20 },
        body: { fontSize: 14, fontWeight: 400, lineHeight: 20 },
        bodyStrong: { fontSize: 14, fontWeight: 600, lineHeight: 20 },
        bodySmall: { fontSize: 13, fontWeight: 400, lineHeight: 18 },
        caption: { fontSize: 12, fontWeight: 500, lineHeight: 16 },
        overline: { fontSize: 11, fontWeight: 700, letterSpacing: 0.8, lineHeight: 14 },
        label: { fontSize: 12, fontWeight: 600, letterSpacing: 0.2, lineHeight: 16 },
        button: { fontSize: 14, fontWeight: 700, letterSpacing: 0.1 },
    },
    control: {
        sm: 32,
        md: 40,
        lg: 46,
    },
} as const;

export type Theme = typeof theme;
