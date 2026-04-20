import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { theme } from '../theme';

interface AdminHeaderProps {
    title: string;
    back?: boolean;
    onBack?: () => void;
    right?: React.ReactNode;
}

export function AdminHeader({ title, back = true, onBack, right }: AdminHeaderProps) {
    const navigate = useNavigate();
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                paddingLeft: 8,
                paddingRight: 12,
                paddingTop: 'calc(env(safe-area-inset-top, 0px) + 10px)',
                paddingBottom: 10,
                backgroundColor: theme.colors.primary,
                color: '#fff',
                position: 'sticky',
                top: 0,
                zIndex: 10,
                gap: 4,
            }}
        >
            {back && (
                <button
                    onClick={() => (onBack ? onBack() : navigate(-1))}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 6,
                        display: 'flex',
                        alignItems: 'center',
                        color: '#fff',
                    }}
                    aria-label="Volver"
                >
                    <ChevronLeft size={26} />
                </button>
            )}
            <h1
                style={{
                    fontSize: 18,
                    fontWeight: 700,
                    lineHeight: '22px',
                    color: '#fff',
                    margin: 0,
                    flex: 1,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                }}
            >
                {title}
            </h1>
            {right}
        </div>
    );
}
