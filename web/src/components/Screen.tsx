import React from 'react';
import { theme } from '../theme';

interface ScreenProps {
    children: React.ReactNode;
    centered?: boolean;
    padded?: boolean;
    background?: string;
    style?: React.CSSProperties;
    className?: string;
    scroll?: boolean;
}

export function Screen({
    children,
    centered,
    padded,
    background = theme.colors.background,
    style,
    className,
    scroll = true,
}: ScreenProps) {
    return (
        <div
            className={className}
            style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                minHeight: 0,
                backgroundColor: background,
                paddingLeft: padded ? 16 : 0,
                paddingRight: padded ? 16 : 0,
                justifyContent: centered ? 'center' : 'flex-start',
                alignItems: centered ? 'center' : 'stretch',
                overflowY: scroll ? 'auto' : 'hidden',
                ...style,
            }}
        >
            {children}
        </div>
    );
}

export function Card({
    children,
    style,
    elevated,
    className,
    onClick,
}: {
    children: React.ReactNode;
    style?: React.CSSProperties;
    elevated?: boolean;
    className?: string;
    onClick?: () => void;
}) {
    return (
        <div
            className={className}
            onClick={onClick}
            style={{
                backgroundColor: theme.colors.surface,
                borderRadius: theme.radius.lg,
                padding: theme.spacing.lg,
                border: `1px solid ${elevated ? 'transparent' : theme.colors.border}`,
                boxShadow: elevated ? '0 2px 6px rgba(26,36,22,0.05)' : 'none',
                ...style,
            }}
        >
            {children}
        </div>
    );
}

export function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 8,
                marginTop: 4,
            }}
        >
            <span
                style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: 0.8,
                    lineHeight: '14px',
                    color: theme.colors.textTertiary,
                    textTransform: 'uppercase',
                }}
            >
                {title}
            </span>
            {action}
        </div>
    );
}
