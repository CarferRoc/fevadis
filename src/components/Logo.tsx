import React from 'react';
import { View, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { theme } from '../theme';

interface LogoProps {
    size?: number;
    color?: string;
    style?: ViewStyle;
}

export function Logo({ size = 64, color = theme.colors.primary, style }: LogoProps) {
    const w = size;
    const h = size * 0.88;
    return (
        <View style={style}>
            <Svg width={w} height={h} viewBox="0 0 120 106" fill="none">
                <Path
                    d="M8 62 L48 14 L62 50 Z"
                    stroke={color}
                    strokeWidth={3.2}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />
                <Path
                    d="M48 14 L62 50 L100 38 L76 30 Z"
                    stroke={color}
                    strokeWidth={3.2}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />
                <Path
                    d="M62 50 L100 38 L112 46 L92 60 Z"
                    stroke={color}
                    strokeWidth={3.2}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />
                <Path
                    d="M62 50 L92 60 L50 96 L30 70 Z"
                    stroke={color}
                    strokeWidth={3.2}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />
                <Path
                    d="M112 46 L118 42 L110 50 Z"
                    fill={color}
                />
            </Svg>
        </View>
    );
}

export function LogoMark({ size = 40, color = '#fff', style }: LogoProps) {
    return <Logo size={size} color={color} style={style} />;
}
