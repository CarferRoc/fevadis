import React from 'react';
import { View, StyleSheet, ViewProps, StatusBar, Platform, Text } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { theme } from '../theme';

interface ScreenProps extends ViewProps {
    children: React.ReactNode;
    centered?: boolean;
    safeArea?: boolean;
    edges?: Edge[];
    background?: string;
    padded?: boolean;
}

export const Screen = ({
    children,
    centered,
    style,
    safeArea = true,
    edges = ['top'],
    background = theme.colors.background,
    padded,
    ...props
}: ScreenProps) => {
    const Container = safeArea ? SafeAreaView : View;
    return (
        <Container
            edges={edges as any}
            style={[
                styles.container,
                { backgroundColor: background },
                centered && styles.centered,
                padded && styles.padded,
                !safeArea && styles.paddingTop,
                style,
            ]}
            {...props}
        >
            <StatusBar barStyle="dark-content" backgroundColor={background} translucent={false} />
            {children}
        </Container>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    paddingTop: {
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    padded: {
        paddingHorizontal: 16,
    },
});

export function Card({
    children,
    style,
    elevated,
    ...props
}: ViewProps & { elevated?: boolean }) {
    return (
        <View style={[cardStyles.card, elevated && cardStyles.elevated, style]} {...props}>
            {children}
        </View>
    );
}

const cardStyles = StyleSheet.create({
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    elevated: {
        ...theme.shadow.sm,
        borderColor: 'transparent',
    },
});

export function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
    return (
        <View style={sectionStyles.row}>
            <Text style={sectionStyles.title}>{title}</Text>
            {action}
        </View>
    );
}

const sectionStyles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
        marginTop: 4,
    },
    title: {
        ...theme.typography.overline,
        color: theme.colors.textTertiary,
        textTransform: 'uppercase',
    },
});
