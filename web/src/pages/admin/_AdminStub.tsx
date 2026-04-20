import { AdminHeader } from '../../components/AdminHeader';
import { theme } from '../../theme';

export function AdminStub({ title, note }: { title: string; note?: string }) {
    return (
        <div style={{ flex: 1, backgroundColor: theme.colors.background, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <AdminHeader title={title} />
            <div style={{ padding: 24, textAlign: 'center', color: theme.colors.textSecondary, fontSize: 14, marginTop: 40 }}>
                {note ?? 'Cargando…'}
            </div>
        </div>
    );
}
