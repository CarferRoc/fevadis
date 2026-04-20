import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export function AuthGate() {
    const { session } = useAuthStore();
    const location = useLocation();

    if (!session) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }
    return <Outlet />;
}
