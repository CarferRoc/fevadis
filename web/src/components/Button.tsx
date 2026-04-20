import React from 'react';
import { theme } from '../theme';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'subtle';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'title'> {
    title: string;
    onPress?: () => void;
    variant?: Variant;
    size?: Size;
    loading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    fullWidth?: boolean;
    style?: React.CSSProperties;
    textStyle?: React.CSSProperties;
}

const HEIGHT: Record<Size, number> = { sm: 32, md: 40, lg: 46 };
const PADDING_X: Record<Size, number> = { sm: 14, md: 18, lg: 22 };
const FONT: Record<Size, number> = { sm: 13, md: 14, lg: 15 };

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
    onClick,
    ...rest
}: ButtonProps) {
    const isDisabled = disabled || loading;
    const v = getVariant(variant);

    return (
        <button
            type={rest.type ?? 'button'}
            disabled={isDisabled}
            onClick={(e) => {
                onClick?.(e);
                if (!isDisabled) onPress?.();
            }}
            className="inline-flex items-center justify-center font-bold transition-transform active:scale-[0.985] select-none"
            style={{
                height: HEIGHT[size],
                paddingLeft: PADDING_X[size],
                paddingRight: PADDING_X[size],
                backgroundColor: v.bg,
                color: v.text,
                border: v.border ? `1px solid ${v.border}` : 'none',
                borderRadius: theme.radius.md,
                opacity: isDisabled ? 0.5 : 1,
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                width: fullWidth ? '100%' : undefined,
                fontSize: FONT[size],
                letterSpacing: 0.1,
                gap: 6,
                ...style,
            }}
            {...rest}
        >
            {loading ? (
                <span
                    aria-label="cargando"
                    style={{
                        display: 'inline-block',
                        width: 14,
                        height: 14,
                        border: `2px solid ${v.text}`,
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'fevadis-spin 0.8s linear infinite',
                    }}
                />
            ) : (
                <>
                    {leftIcon}
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', ...textStyle }}>
                        {title}
                    </span>
                    {rightIcon}
                </>
            )}
            <style>{`@keyframes fevadis-spin { to { transform: rotate(360deg); } }`}</style>
        </button>
    );
}
