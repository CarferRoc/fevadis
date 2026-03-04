import React from 'react';
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
}

export function FormInput({ label, error, style, ...props }: FormInputProps) {
    return (
        <View style={styles.wrapper}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TextInput
                style={[
                    styles.input,
                    error ? styles.inputError : undefined,
                    style,
                ]}
                placeholderTextColor={theme.colors.textTertiary}
                {...props}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: 4,
    },
    label: {
        ...theme.typography.label,
        color: theme.colors.text,
        marginBottom: 8,
    },
    input: {
        backgroundColor: theme.colors.surfaceAlt,
        color: theme.colors.text,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: 14,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1.5,
        borderColor: theme.colors.border,
        fontSize: 15,
        fontWeight: '400',
    },
    inputError: {
        borderColor: theme.colors.error,
        backgroundColor: '#FEF2F2',
    },
    errorText: {
        color: theme.colors.error,
        fontSize: 12,
        fontWeight: '500',
        marginTop: 5,
        marginLeft: 2,
    },
});
