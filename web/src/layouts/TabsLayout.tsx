import type { ReactNode } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Calendar, BookOpen, MessageSquare, UserCircle2 } from 'lucide-react';
import { theme } from '../theme';

interface TabDef {
    to: string;
    label: string;
    icon: (props: { color: string; size: number; strokeWidth: number }) => ReactNode;
    matches?: RegExp[];
}

const TABS: TabDef[] = [
    {
        to: '/activities',
        label: 'Actividades',
        icon: (p) => <Calendar {...p} />,
        matches: [/^\/activities/],
    },
    {
        to: '/info',
        label: 'Información',
        icon: (p) => <BookOpen {...p} />,
        matches: [/^\/info/],
    },
    {
        to: '/chats',
        label: 'Chats',
        icon: (p) => <MessageSquare {...p} />,
        matches: [/^\/chats/],
    },
    {
        to: '/profile',
        label: 'Perfil',
        icon: (p) => <UserCircle2 {...p} />,
        matches: [/^\/profile/],
    },
];

export function TabsLayout() {
    const location = useLocation();
    return (
        <>
            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 0,
                    overflow: 'hidden',
                    paddingBottom: 68, // space for tab bar
                }}
            >
                <Outlet />
            </div>
            <nav
                style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    maxWidth: 520,
                    margin: '0 auto',
                    backgroundColor: theme.colors.surface,
                    borderTop: `1px solid ${theme.colors.border}`,
                    display: 'flex',
                    paddingBottom: 'env(safe-area-inset-bottom, 0px)',
                    zIndex: 20,
                }}
            >
                {TABS.map((tab) => {
                    const active = tab.matches?.some((rx) => rx.test(location.pathname)) ?? location.pathname.startsWith(tab.to);
                    const color = active ? theme.colors.primaryDark : theme.colors.textTertiary;
                    return (
                        <NavLink
                            key={tab.to}
                            to={tab.to}
                            style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '6px 0 4px',
                                textDecoration: 'none',
                                color,
                                gap: 2,
                            }}
                        >
                            {tab.icon({ color, size: active ? 22 : 20, strokeWidth: active ? 2.4 : 2 })}
                            <span style={{ fontSize: 10.5, fontWeight: 600 }}>{tab.label}</span>
                        </NavLink>
                    );
                })}
            </nav>
        </>
    );
}
