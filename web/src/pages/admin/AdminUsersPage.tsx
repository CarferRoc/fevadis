import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminService } from '../../services/adminService';
import { useAuthStore } from '../../store/useAuthStore';
import { RoleBadge } from '../../components/RoleBadge';
import { EmptyState } from '../../components/EmptyState';
import { Button } from '../../components/Button';
import { AdminHeader } from '../../components/AdminHeader';
import { theme } from '../../theme';
import type { Profile, UserRole } from '../../types';

const ROLES: UserRole[] = ['admin', 'editor', 'voluntario'];

export function AdminUsersPage() {
    const { user: currentUser } = useAuthStore();
    const navigate = useNavigate();
    const [selected, setSelected] = useState<Profile | null>(null);

    const { data: users, refetch, isLoading } = useQuery({
        queryKey: ['admin-users'],
        queryFn: adminService.getUsers,
    });

    async function handleChangeRole(newRole: UserRole) {
        if (!selected) return;
        setSelected(null);
        try {
            await adminService.changeRole(selected.user_id, newRole);
            toast.success('Rol actualizado', { description: `${selected.nombre} ahora es ${newRole}.` });
            refetch();
        } catch (e: any) {
            toast.error('Error', { description: e.message });
        }
    }

    return (
        <div style={{ flex: 1, backgroundColor: theme.colors.background, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <AdminHeader title="Usuarios" back />

            <div style={{ padding: 16, paddingBottom: 32 }}>
                {isLoading ? (
                    <div style={{ textAlign: 'center', color: theme.colors.textSecondary, padding: 24 }}>Cargando…</div>
                ) : users && users.length > 0 ? (
                    users.map((item) => {
                        const isMe = item.user_id === currentUser?.id;
                        const fullName = `${item.nombre} ${item.apellidos}`.trim();
                        return (
                            <div
                                key={item.user_id}
                                style={{
                                    backgroundColor: theme.colors.surface,
                                    borderRadius: theme.radius.lg,
                                    padding: 12,
                                    marginBottom: 12,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 8,
                                    boxShadow: '0 2px 6px rgba(26,36,22,0.05)',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div
                                        style={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: 24,
                                            backgroundColor: theme.colors.primaryLight + '4D',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            flexShrink: 0,
                                        }}
                                    >
                                        <span style={{ fontSize: 18, fontWeight: 700, color: theme.colors.primary }}>
                                            {item.nombre?.[0]}
                                            {item.apellidos?.[0]}
                                        </span>
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                        <div style={{ fontSize: 15, fontWeight: 700, color: theme.colors.text }}>
                                            {fullName}
                                            {isMe && <span style={{ fontSize: 12, color: theme.colors.textSecondary, fontWeight: 400 }}>{' '}(tú)</span>}
                                        </div>
                                        <div style={{ fontSize: 13, color: theme.colors.textSecondary }}>{item.dni}</div>
                                        <RoleBadge role={item.role} size="sm" />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <Button
                                        title="📁 Ver archivos"
                                        variant="outline"
                                        size="sm"
                                        onPress={() => navigate(`/admin/users/${item.user_id}/documents?name=${encodeURIComponent(fullName)}`)}
                                        style={{ flex: 1 }}
                                    />
                                    {!isMe && (
                                        <Button title="Cambiar rol" variant="outline" size="sm" onPress={() => setSelected(item)} style={{ flex: 1 }} />
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <EmptyState icon="👥" title="Sin usuarios" subtitle="No hay usuarios registrados aún." />
                )}
            </div>

            {selected && (
                <div
                    style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
                    onClick={() => setSelected(null)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: '100%',
                            maxWidth: 520,
                            backgroundColor: theme.colors.surface,
                            borderTopLeftRadius: 20,
                            borderTopRightRadius: 20,
                            padding: 24,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 12,
                        }}
                    >
                        <div style={{ fontSize: 17, fontWeight: 700, color: theme.colors.text }}>Cambiar rol de {selected.nombre}</div>
                        <div style={{ fontSize: 13, color: theme.colors.textSecondary }}>Rol actual: {selected.role}</div>
                        {ROLES.map((role) => (
                            <div
                                key={role}
                                onClick={() => handleChangeRole(role)}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: 12,
                                    borderRadius: theme.radius.md,
                                    backgroundColor: theme.colors.background,
                                    border: selected.role === role ? `1.5px solid ${theme.colors.primary}` : '1.5px solid transparent',
                                    cursor: 'pointer',
                                }}
                            >
                                <RoleBadge role={role} />
                                {selected.role === role && (
                                    <span style={{ fontSize: 12, color: theme.colors.primary, fontWeight: 600 }}>Actual</span>
                                )}
                            </div>
                        ))}
                        <Button title="Cancelar" variant="ghost" onPress={() => setSelected(null)} />
                    </div>
                </div>
            )}
        </div>
    );
}
