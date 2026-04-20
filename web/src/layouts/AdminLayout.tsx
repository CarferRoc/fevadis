import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { theme } from '../theme';

export function AdminLayout() {
    const { isAdminOrEditor } = useAuthStore();

    if (!isAdminOrEditor) {
        return (
            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: theme.colors.background,
                    color: theme.colors.error,
                    fontSize: 17,
                    fontWeight: 700,
                }}
            >
                Acceso denegado
            </div>
        );
    }

    return <Outlet />;
}
