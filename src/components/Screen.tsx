import React from 'react';
import { View, StyleSheet, ViewProps, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';

interface ScreenProps extends ViewProps {
    children: React.ReactNode;
    centered?: boolean;
    safeArea?: boolean; // Default true
}

export const Screen = ({ children, centered, style, safeArea = true, ...props }: ScreenProps) => {
    const Container = safeArea ? SafeAreaView : View;

    return (
        <Container
            style={[
                styles.container,
                centered && styles.centered,
                !safeArea && styles.paddingTop,
                style,
            ]}
            {...props}
        >
            <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
            {children}
        </Container>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    paddingTop: {
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});
