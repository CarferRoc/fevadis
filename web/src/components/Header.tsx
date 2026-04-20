import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { theme } from '../theme';

interface HeaderProps {
    title: string;
    back?: boolean;
    onBack?: () => void;
    right?: React.ReactNode;
}

export function Header({ title, back, onBack, right }: HeaderProps) {
    const navigate = useNavigate();
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingLeft: 12,
                paddingRight: 12,
                paddingTop: 'calc(env(safe-area-inset-top, 0px) + 10px)',
                paddingBottom: 10,
                backgroundColor: theme.colors.background,
                borderBottom: `1px solid ${theme.colors.border}`,
                position: 'sticky',
                top: 0,
                zIndex: 10,
                gap: 8,
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                {back && (
                    <button
                        onClick={() => (onBack ? onBack() : navigate(-1))}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 6,
                            marginLeft: -6,
                            display: 'flex',
                            alignItems: 'center',
                            color: theme.colors.text,
                        }}
                        aria-label="Volver"
                    >
                        <ChevronLeft size={24} />
                    </button>
                )}
                <h1
                    style={{
                        fontSize: 20,
                        fontWeight: 700,
                        letterSpacing: -0.2,
                        lineHeight: '26px',
                        color: theme.colors.text,
                        margin: 0,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                >
                    {title}
                </h1>
            </div>
            {right}
        </div>
    );
}
