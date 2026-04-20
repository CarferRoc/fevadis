import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';
import { UserRole } from '../types';

interface RoleBadgeProps {
    role: UserRole;
    size?: 'sm' | 'md';
}

const ROLE_LABELS: Record<UserRole, string> = {
    admin: 'Administrador',
    editor: 'Editor',
    voluntario: 'Voluntario',
};

const ROLE_COLORS: Record<UserRole, { bg: string; text: string }> = {
    admin: { bg: theme.colors.roleAdminSoft, text: theme.colors.roleAdmin },
    editor: { bg: theme.colors.roleEditorSoft, text: theme.colors.roleEditor },
    voluntario: { bg: theme.colors.roleVoluntarioSoft, text: theme.colors.roleVoluntario },
};

export function RoleBadge({ role, size = 'md' }: RoleBadgeProps) {
    const c = ROLE_COLORS[role];
    return (
        <View
            style={[
                styles.badge,
                { backgroundColor: c.bg },
                size === 'sm' && styles.badgeSm,
            ]}
        >
            <Text
                style={[
                    styles.text,
                    { color: c.text },
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
        paddingHorizontal: 9,
        paddingVertical: 3,
        borderRadius: theme.radius.pill,
        alignSelf: 'flex-start',
    },
    badgeSm: {
        paddingHorizontal: 7,
        paddingVertical: 2,
    },
    text: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.1,
    },
    textSm: {
        fontSize: 10.5,
    },
});
