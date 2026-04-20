import { theme } from '../theme';
import type { UserRole } from '../types';

const ROLE_LABELS: Record<UserRole, string> = {
    admin: 'Administrador',
    editor: 'Editor',
    voluntario: 'Voluntario',
};

const ROLE_COLORS: Record<UserRole, { bg: string; text: string }> = {
    admin: { bg: theme.colors.roleAdminSoft, text: theme.colors.roleAdmin },
    editor: { bg: theme.colors.roleEditorSoft, text: theme.colors.roleEditor },
    voluntario: { bg: theme.colors.roleVoluntarioSoft, text: theme.colors.roleVoluntario },
};

export function RoleBadge({ role, size = 'md' }: { role: UserRole; size?: 'sm' | 'md' }) {
    const c = ROLE_COLORS[role];
    return (
        <span
            style={{
                display: 'inline-block',
                paddingLeft: size === 'sm' ? 7 : 9,
                paddingRight: size === 'sm' ? 7 : 9,
                paddingTop: size === 'sm' ? 2 : 3,
                paddingBottom: size === 'sm' ? 2 : 3,
                borderRadius: 9999,
                backgroundColor: c.bg,
                color: c.text,
                fontSize: size === 'sm' ? 10.5 : 12,
                fontWeight: 700,
                letterSpacing: 0.1,
            }}
        >
            {ROLE_LABELS[role]}
        </span>
    );
}
