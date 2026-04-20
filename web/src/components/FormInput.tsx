import React, { useState, forwardRef } from 'react';
import { theme } from '../theme';

interface FormInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    label?: string;
    error?: string;
    hint?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    multiline?: boolean;
    numberOfLines?: number;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(function FormInput(
    { label, error, hint, style, leftIcon, rightIcon, onFocus, onBlur, multiline, numberOfLines, ...props },
    ref
) {
    const [focused, setFocused] = useState(false);

    const wrapStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: error
            ? theme.colors.errorSoft
            : focused
                ? theme.colors.primarySoft
                : theme.colors.surface,
        borderRadius: theme.radius.md,
        border: `1px solid ${error ? theme.colors.error : focused ? theme.colors.primary : theme.colors.border}`,
        paddingLeft: 12,
        paddingRight: 12,
        minHeight: 42,
        gap: 4,
    };

    const inputStyle: React.CSSProperties = {
        flex: 1,
        color: theme.colors.text,
        fontSize: 14,
        fontWeight: 500,
        padding: '10px 0',
        border: 'none',
        outline: 'none',
        background: 'transparent',
        width: '100%',
        minWidth: 0,
        ...style,
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {label && (
                <span
                    style={{
                        fontSize: 12,
                        fontWeight: 600,
                        letterSpacing: 0.2,
                        lineHeight: '16px',
                        color: theme.colors.textSecondary,
                        marginLeft: 2,
                    }}
                >
                    {label}
                </span>
            )}
            <div style={wrapStyle}>
                {leftIcon && <span style={{ padding: '0 4px', display: 'flex', alignItems: 'center' }}>{leftIcon}</span>}
                {multiline ? (
                    <textarea
                        rows={numberOfLines ?? 4}
                        style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' } as React.CSSProperties}
                        onFocus={(e: any) => { setFocused(true); onFocus?.(e); }}
                        onBlur={(e: any) => { setFocused(false); onBlur?.(e); }}
                        {...(props as any)}
                    />
                ) : (
                    <input
                        ref={ref}
                        style={inputStyle}
                        onFocus={(e) => { setFocused(true); onFocus?.(e); }}
                        onBlur={(e) => { setFocused(false); onBlur?.(e); }}
                        {...props}
                    />
                )}
                {rightIcon && <span style={{ padding: '0 4px', display: 'flex', alignItems: 'center' }}>{rightIcon}</span>}
            </div>
            {error ? (
                <span style={{ color: theme.colors.error, fontSize: 12, fontWeight: 500, marginLeft: 2 }}>{error}</span>
            ) : hint ? (
                <span style={{ color: theme.colors.textTertiary, fontSize: 12, marginLeft: 2 }}>{hint}</span>
            ) : null}
        </div>
    );
});
