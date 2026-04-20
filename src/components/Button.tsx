import React from 'react';
import {
    Pressable,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
    View,
} from 'react-native';
import { theme } from '../theme';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'subtle';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
    title: string;
    onPress?: () => void;
    variant?: Variant;
    size?: Size;
    loading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    fullWidth?: boolean;
}

const HEIGHT: Record<Size, number> = { sm: 32, md: 40, lg: 46 };
const PADDING_X: Record<Size, number> = { sm: 14, md: 18, lg: 22 };
const FONT: Record<Size, number> = { sm: 13, md: 14, lg: 15 };

export function Button({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    style,
    textStyle,
    leftIcon,
    rightIcon,
    fullWidth,
}: ButtonProps) {
    const isDisabled = disabled || loading;
    const v = getVariant(variant);

    return (
        <Pressable
            onPress={onPress}
            disabled={isDisabled}
            style={({ pressed }) => [
                styles.base,
                {
                    height: HEIGHT[size],
                    paddingHorizontal: PADDING_X[size],
                    backgroundColor: v.bg,
                    borderColor: v.border,
                    borderWidth: v.border ? 1 : 0,
                    opacity: isDisabled ? 0.5 : pressed ? 0.88 : 1,
                    transform: [{ scale: pressed && !isDisabled ? 0.985 : 1 }],
                    alignSelf: fullWidth ? 'stretch' : undefined,
                    width: fullWidth ? '100%' : undefined,
                },
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator color={v.text} size="small" />
            ) : (
                <View style={styles.content}>
                    {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
                    <Text
                        style={[
                            styles.text,
                            { color: v.text, fontSize: FONT[size] },
                            textStyle,
                        ]}
                        numberOfLines={1}
                    >
                        {title}
                    </Text>
                    {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
                </View>
            )}
        </Pressable>
    );
}

function getVariant(v: Variant): { bg: string; text: string; border?: string } {
    switch (v) {
        case 'primary':
            return { bg: theme.colors.primary, text: '#fff' };
        case 'secondary':
            return { bg: theme.colors.text, text: '#fff' };
        case 'outline':
            return {
                bg: theme.colors.surface,
                text: theme.colors.text,
                border: theme.colors.border,
            };
        case 'subtle':
            return { bg: theme.colors.primaryLight, text: theme.colors.primaryDark };
        case 'ghost':
            return { bg: 'transparent', text: theme.colors.textSecondary };
        case 'danger':
            return { bg: theme.colors.error, text: '#fff' };
    }
}

const styles = StyleSheet.create({
    base: {
        borderRadius: theme.radius.md,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    text: {
        fontWeight: '700',
        letterSpacing: 0.1,
    },
    iconLeft: {},
    iconRight: {},
});
