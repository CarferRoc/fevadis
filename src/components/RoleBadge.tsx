import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';
import { UserRole } from '../types';

interface RoleBadgeProps {
    role: UserRole;
    size?: 'sm' | 'md';
}

const ROLE_LABELS: Record<UserRole, string> = {
    admin: 'Admin',
    editor: 'Editor',
    voluntario: 'Voluntario',
};

const ROLE_COLORS: Record<UserRole, { bg: string; text: string }> = {
    admin: { bg: '#EEF2FF', text: theme.colors.primary },
    editor: { bg: '#FFFBEB', text: '#B45309' },
    voluntario: { bg: '#ECFDF5', text: '#065F46' },
};

export function RoleBadge({ role, size = 'md' }: RoleBadgeProps) {
    const colors = ROLE_COLORS[role];
    return (
        <View
            style={[
                styles.badge,
                { backgroundColor: colors.bg },
                size === 'sm' && styles.badgeSm,
            ]}
        >
            <Text
                style={[
                    styles.text,
                    { color: colors.text },
                    size === 'sm' && styles.textSm,
                ]}
            >
                {ROLE_LABELS[role]}
            </Text>
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
    badgeSm: {
        paddingHorizontal: 7,
        paddingVertical: 2,
    },
    text: {
        fontSize: 13,
        fontWeight: '600',
    },
    textSm: {
        fontSize: 11,
    },
});
