import { theme } from '../theme';

interface LogoProps {
    size?: number;
    color?: string;
    style?: React.CSSProperties;
    className?: string;
}

export function Logo({ size = 64, color = theme.colors.primary, style, className }: LogoProps) {
    const w = size;
    const h = size * 0.88;
    return (
        <div style={{ width: w, height: h, ...style }} className={className}>
            <svg width={w} height={h} viewBox="0 0 120 106" fill="none">
                <path
                    d="M8 62 L48 14 L62 50 Z"
                    stroke={color}
                    strokeWidth={3.2}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />
                <path
                    d="M48 14 L62 50 L100 38 L76 30 Z"
                    stroke={color}
                    strokeWidth={3.2}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />
                <path
                    d="M62 50 L100 38 L112 46 L92 60 Z"
                    stroke={color}
                    strokeWidth={3.2}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />
                <path
                    d="M62 50 L92 60 L50 96 L30 70 Z"
                    stroke={color}
                    strokeWidth={3.2}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />
                <path d="M112 46 L118 42 L110 50 Z" fill={color} />
            </svg>
        </div>
    );
}

export function LogoMark({ size = 40, color = '#fff', style, className }: LogoProps) {
    return <Logo size={size} color={color} style={style} className={className} />;
}
