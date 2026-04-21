interface LogoProps {
    size?: number;
    style?: React.CSSProperties;
    className?: string;
}

/**
 * Logo oficial FEVADIS (pájaro verde).
 * Mantiene la proporción original 520×470 (~1.106:1).
 */
export function Logo({ size = 64, style, className }: LogoProps) {
    const aspect = 520 / 470;
    return (
        <img
            src="/logo.png"
            alt="Fevadis"
            width={Math.round(size * aspect)}
            height={size}
            style={{ display: 'block', ...style }}
            className={className}
            draggable={false}
        />
    );
}

export function LogoMark({ size = 40, style, className }: LogoProps) {
    return <Logo size={size} style={style} className={className} />;
}
