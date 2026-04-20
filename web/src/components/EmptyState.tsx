import React from 'react';
import { theme } from '../theme';

interface EmptyStateProps {
    title: string;
    subtitle?: string;
    icon?: React.ReactNode | string;
    action?: React.ReactNode;
}

export function EmptyState({ title, subtitle, icon, action }: EmptyStateProps) {
    return (
        <div
            style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: theme.spacing.xxl,
                marginTop: theme.spacing.xxxl,
            }}
        >
            <div
                style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor: theme.colors.surfaceAlt,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: theme.spacing.lg,
                }}
            >
                {typeof icon === 'string' || icon === undefined ? (
                    <span style={{ fontSize: 28 }}>{(icon as string) || '•'}</span>
                ) : (
                    icon
                )}
            </div>
            <div
                style={{
                    fontSize: 17,
                    fontWeight: 700,
                    lineHeight: '22px',
                    color: theme.colors.text,
                    textAlign: 'center',
                    marginBottom: 6,
                }}
            >
                {title}
            </div>
            {subtitle && (
                <div
                    style={{
                        fontSize: 14,
                        lineHeight: '20px',
                        color: theme.colors.textSecondary,
                        textAlign: 'center',
                        maxWidth: 280,
                    }}
                >
                    {subtitle}
                </div>
            )}
            {action && <div style={{ marginTop: theme.spacing.lg }}>{action}</div>}
        </div>
    );
}
