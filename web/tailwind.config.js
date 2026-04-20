import { theme as appTheme } from './src/theme/index.ts';

/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{ts,tsx}'],
    theme: {
        extend: {
            colors: {
                brand: {
                    DEFAULT: appTheme.colors.primary,
                    dark: appTheme.colors.primaryDark,
                    darker: appTheme.colors.primaryDarker,
                    light: appTheme.colors.primaryLight,
                    soft: appTheme.colors.primarySoft,
                    surface: appTheme.colors.primarySurface,
                },
                accent: {
                    DEFAULT: appTheme.colors.accent,
                    soft: appTheme.colors.accentSoft,
                },
                surface: {
                    DEFAULT: appTheme.colors.surface,
                    alt: appTheme.colors.surfaceAlt,
                    muted: appTheme.colors.surfaceMuted,
                },
                ink: {
                    DEFAULT: appTheme.colors.text,
                    secondary: appTheme.colors.textSecondary,
                    tertiary: appTheme.colors.textTertiary,
                    inverse: appTheme.colors.textInverse,
                },
                border: {
                    DEFAULT: appTheme.colors.border,
                    strong: appTheme.colors.borderStrong,
                    focus: appTheme.colors.borderFocus,
                },
                danger: appTheme.colors.error,
                'danger-soft': appTheme.colors.errorSoft,
                success: appTheme.colors.success,
                'success-soft': appTheme.colors.successSoft,
                warning: appTheme.colors.warning,
                'warning-soft': appTheme.colors.warningSoft,
                info: appTheme.colors.info,
                'info-soft': appTheme.colors.infoSoft,
                bg: appTheme.colors.background,
            },
            borderRadius: {
                xs: '6px',
                sm: '8px',
                md: '10px',
                lg: '14px',
                xl: '20px',
            },
            boxShadow: {
                xs: '0 1px 2px rgba(26,36,22,0.04)',
                sm: '0 2px 6px rgba(26,36,22,0.05)',
                md: '0 6px 16px rgba(26,36,22,0.08)',
                lg: '0 12px 28px rgba(26,36,22,0.10)',
            },
        },
    },
    plugins: [],
};
