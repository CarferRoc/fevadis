import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';

interface EmptyStateProps {
    title: string;
    subtitle?: string;
    icon?: React.ReactNode | string;
    action?: React.ReactNode;
}

export function EmptyState({ title, subtitle, icon, action }: EmptyStateProps) {
    return (
        <View style={styles.container}>
            <View style={styles.iconWrap}>
                {typeof icon === 'string' || icon === undefined ? (
                    <Text style={styles.emoji}>{(icon as string) || '•'}</Text>
                ) : (
                    icon
                )}
            </View>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            {action && <View style={styles.action}>{action}</View>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.xxl,
        marginTop: theme.spacing.xxxl,
    },
    iconWrap: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: theme.colors.surfaceAlt,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
    },
    emoji: { fontSize: 28 },
    title: {
        ...theme.typography.h3,
        color: theme.colors.text,
        textAlign: 'center',
        marginBottom: 6,
    },
    subtitle: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        maxWidth: 280,
    },
    action: {
        marginTop: theme.spacing.lg,
    },
});
