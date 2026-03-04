import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { theme } from '../theme';

type Variant = 'primary' | 'secondary' | 'outline' | 'danger' | 'warning' | 'ghost';

interface ButtonProps {
    title: string;
    onPress?: () => void;
    variant?: Variant;
    loading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    size?: 'sm' | 'md' | 'lg';
}

const VARIANTS: Record<Variant, { bg: string; text: string; border?: string }> = {
    primary: { bg: theme.colors.primary, text: '#fff' },
    secondary: { bg: theme.colors.secondary, text: '#fff' },
    outline: { bg: 'transparent', text: theme.colors.primary, border: theme.colors.primary },
    danger: { bg: theme.colors.error, text: '#fff' },
    warning: { bg: theme.colors.warning, text: '#fff' },
    ghost: { bg: 'transparent', text: theme.colors.textSecondary },
};

export function Button({
    title,
    onPress,
    variant = 'primary',
    loading = false,
    disabled = false,
    style,
    textStyle,
    size = 'md',
}: ButtonProps) {
    const variantStyle = VARIANTS[variant];
    const isDisabled = disabled || loading;

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={isDisabled}
            style={[
                styles.base,
                {
                    backgroundColor: variantStyle.bg,
                    borderWidth: variantStyle.border ? 1.5 : 0,
                    borderColor: variantStyle.border ?? 'transparent',
                    opacity: isDisabled ? 0.55 : 1,
                },
                size === 'sm' && styles.sm,
                size === 'lg' && styles.lg,
                style,
            ]}
            activeOpacity={0.78}
        >
            {loading ? (
                <ActivityIndicator color={variantStyle.text} size="small" />
            ) : (
                <Text
                    style={[
                        styles.text,
                        { color: variantStyle.text },
                        size === 'sm' && styles.textSm,
                        size === 'lg' && styles.textLg,
                        textStyle,
                    ]}
                >
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    base: {
        paddingVertical: 14,
        paddingHorizontal: 22,
        borderRadius: theme.borderRadius.full,   // Pill shape
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 50,
    },
    sm: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        minHeight: 36,
        borderRadius: theme.borderRadius.full,
    },
    lg: {
        paddingVertical: 17,
        borderRadius: theme.borderRadius.full,
    },
    text: {
        ...theme.typography.button,
        fontSize: 15,
    },
    textSm: { fontSize: 13 },
    textLg: { fontSize: 16 },
});
