import React from 'react';
import { Image, ViewStyle } from 'react-native';

interface LogoProps {
    size?: number;
    style?: ViewStyle;
}

/**
 * Logo oficial FEVADIS. Proporción original 520×470.
 */
export function Logo({ size = 64, style }: LogoProps) {
    const aspect = 520 / 470;
    return (
        <Image
            source={require('../../assets/logo.png')}
            style={[
                {
                    width: Math.round(size * aspect),
                    height: size,
                    resizeMode: 'contain',
                },
                style,
            ]}
        />
    );
}

export function LogoMark({ size = 40, style }: LogoProps) {
    return <Logo size={size} style={style} />;
}
