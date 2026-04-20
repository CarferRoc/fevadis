import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useAuthStore } from '../../store/useAuthStore';
import { FormInput } from '../../components/FormInput';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { AdminHeader } from '../../components/AdminHeader';
import { theme } from '../../theme';
import type { AuthorizedDni } from '../../types';
import { getDniError, formatDni } from '../../utils/dniValidator';

const STATUS_COLORS: Record<AuthorizedDni['status'], { bg: string; text: string }> = {
    activo: { bg: '#ECFDF5', text: '#065F46' },
    usado: { bg: '#F3F4F6', text: '#374151' },
    revocado: { bg: '#FEE2E2', text: '#991B1B' },
};

export function AdminAuthorizedDnisPage() {
    const { user } = useAuthStore();
    const [newDni, setNewDni] = useState('');
    const [dniError, setDniError] = useState('');
    const [adding, setAdding] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const { data: dnis, refetch, isLoading } = useQuery({
        queryKey: ['authorized-dnis'],
        queryFn: adminService.getAuthorizedDnis,
    });

    async function handleAdd() {
        const err = getDniError(newDni);
        if (err) {
            setDniError(err);
            return;
        }
        setAdding(true);
        try {
            await adminService.addAuthorizedDni(formatDni(newDni), user!.id);
            setNewDni('');
            setShowForm(false);
            refetch();
        } catch (e: any) {
            toast.error('Error', { description: e.message });
        } finally {
            setAdding(false);
        }
    }

    async function handleRevoke(item: AuthorizedDni) {
        if (!window.confirm(`¿Revocar el DNI ${item.dni}?`)) return;
        try {
            await adminService.revokeAuthorizedDni(item.id);
            refetch();
        } catch (e: any) {
            toast.error('Error', { description: e.message });
        }
    }

    return (
        <div style={{ flex: 1, backgroundColor: theme.colors.background, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <AdminHeader title="DNIs Autorizados" back />

            {showForm ? (
                <div
                    style={{
                        backgroundColor: theme.colors.surface,
                        padding: 16,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12,
                        borderBottom: `1px solid ${theme.colors.border}`,
                    }}
                >
                    <FormInput
                        label="Nuevo DNI a autorizar"
                        placeholder="00000000A"
                        value={newDni}
                        onChange={(e) => {
                            setNewDni(e.target.value.toUpperCase());
                            if (dniError) setDniError('');
                        }}
                        autoCapitalize="characters"
                        maxLength={9}
                        error={dniError}
                    />
                    <div style={{ display: 'flex', gap: 8 }}>
                        <Button title="Añadir" onPress={handleAdd} loading={adding} style={{ flex: 1 }} />
                        <Button title="Cancelar" variant="outline" onPress={() => setShowForm(false)} style={{ flex: 1 }} />
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setShowForm(true)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: 16,
                        backgroundColor: theme.colors.surface,
                        borderBottom: `1px solid ${theme.colors.border}`,
                        border: 'none',
                        cursor: 'pointer',
                        width: '100%',
                        borderLeft: 'none',
                        borderRight: 'none',
                        borderTop: 'none',
                    }}
                >
                    <Plus size={18} color={theme.colors.primary} />
                    <span style={{ fontSize: 14, color: theme.colors.primary, fontWeight: 600 }}>Añadir DNI autorizado</span>
                </button>
            )}

            <div style={{ padding: 16, paddingBottom: 32 }}>
                {isLoading ? (
                    <div style={{ textAlign: 'center', color: theme.colors.textSecondary, padding: 24 }}>Cargando…</div>
                ) : dnis && dnis.length > 0 ? (
                    dnis.map((item) => {
                        const cfg = STATUS_COLORS[item.status];
                        return (
                            <div
                                key={item.id}
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
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ fontSize: 15, fontWeight: 700, color: theme.colors.text, letterSpacing: 1 }}>
                                            {item.dni}
                                        </div>
                                        <div style={{ fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 }}>
                                            Alta: {format(new Date(item.created_at), 'd MMM yyyy', { locale: es })}
                                        </div>
                                        {item.used_at && (
                                            <div style={{ fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 }}>
                                                Usado: {format(new Date(item.used_at), 'd MMM yyyy', { locale: es })}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ padding: '4px 10px', borderRadius: 9999, backgroundColor: cfg.bg }}>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: cfg.text }}>{item.status.toUpperCase()}</span>
                                    </div>
                                </div>
                                {item.status === 'activo' && (
                                    <Button title="Revocar" variant="danger" size="sm" onPress={() => handleRevoke(item)} style={{ alignSelf: 'flex-start' }} />
                                )}
                            </div>
                        );
                    })
                ) : (
                    <EmptyState icon="🪪" title="Sin DNIs autorizados" subtitle="Añade DNIs para que puedan registrarse." />
                )}
            </div>
        </div>
    );
}
