import React, { useState } from 'react';
import {
    TextInput,
    Text,
    View,
    StyleSheet,
    TextInputProps,
} from 'react-native';
import { theme } from '../theme';

interface FormInputProps extends TextInputProps {
    label?: string;
    error?: string;
    hint?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export function FormInput({
    label,
    error,
    hint,
    style,
    leftIcon,
    rightIcon,
    onFocus,
    onBlur,
    ...props
}: FormInputProps) {
    const [focused, setFocused] = useState(false);

    return (
        <View style={styles.wrapper}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View
                style={[
                    styles.fieldWrap,
                    focused && styles.fieldWrapFocused,
                    !!error && styles.fieldWrapError,
                ]}
            >
                {leftIcon && <View style={styles.icon}>{leftIcon}</View>}
                <TextInput
                    style={[styles.input, style]}
                    placeholderTextColor={theme.colors.textTertiary}
                    onFocus={(e) => {
                        setFocused(true);
                        onFocus?.(e);
                    }}
                    onBlur={(e) => {
                        setFocused(false);
                        onBlur?.(e);
                    }}
                    {...props}
                />
                {rightIcon && <View style={styles.icon}>{rightIcon}</View>}
            </View>
            {error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : hint ? (
                <Text style={styles.hintText}>{hint}</Text>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        gap: 6,
    },
    label: {
        ...theme.typography.label,
        color: theme.colors.textSecondary,
        marginLeft: 2,
    },
    fieldWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        paddingHorizontal: 12,
        minHeight: 42,
    },
    fieldWrapFocused: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.primarySoft,
    },
    fieldWrapError: {
        borderColor: theme.colors.error,
        backgroundColor: theme.colors.errorSoft,
    },
    input: {
        flex: 1,
        color: theme.colors.text,
        fontSize: 14,
        fontWeight: '500',
        paddingVertical: 10,
    },
    icon: {
        paddingHorizontal: 4,
    },
    errorText: {
        color: theme.colors.error,
        fontSize: 12,
        fontWeight: '500',
        marginLeft: 2,
    },
    hintText: {
        color: theme.colors.textTertiary,
        fontSize: 12,
        marginLeft: 2,
    },
});
