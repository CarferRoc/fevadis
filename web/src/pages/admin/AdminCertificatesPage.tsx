import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Folder, ChevronRight, Users } from 'lucide-react';
import { documentService } from '../../services/documentService';
import { EmptyState } from '../../components/EmptyState';
import { AdminHeader } from '../../components/AdminHeader';
import { theme } from '../../theme';

export function AdminCertificatesPage() {
    const navigate = useNavigate();
    const { data: folders, isLoading } = useQuery({
        queryKey: ['cert-folders'],
        queryFn: documentService.getCertificatesByActivity,
    });

    return (
        <div style={{ flex: 1, backgroundColor: theme.colors.background, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <AdminHeader title="Certificados" back />
            <div style={{ padding: 12 }}>
                {isLoading ? (
                    <div style={{ textAlign: 'center', color: theme.colors.textSecondary, padding: 24 }}>Cargando…</div>
                ) : folders && folders.length > 0 ? (
                    folders.map((item) => (
                        <div
                            key={item.activity.id}
                            onClick={() => navigate(`/admin/activities/${item.activity.id}/attendees?title=${encodeURIComponent(item.activity.titulo)}`)}
                            style={{
                                backgroundColor: theme.colors.surface,
                                borderRadius: theme.radius.lg,
                                padding: 12,
                                marginBottom: 8,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 14,
                                boxShadow: '0 2px 6px rgba(26,36,22,0.05)',
                                cursor: 'pointer',
                            }}
                        >
                            <div
                                style={{
                                    width: 52,
                                    height: 52,
                                    borderRadius: 14,
                                    backgroundColor: theme.colors.catCampamentos + '26',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                <Folder size={28} color={theme.colors.catCampamentos} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 15, fontWeight: 700, color: theme.colors.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {item.activity.titulo}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
                                    <Users size={13} color={theme.colors.textSecondary} />
                                    <span style={{ fontSize: 13, color: theme.colors.textSecondary }}>
                                        {item.count} asistente{item.count !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>
                            <ChevronRight size={18} color={theme.colors.textTertiary} />
                        </div>
                    ))
                ) : (
                    <EmptyState icon="📂" title="Sin certificados" subtitle="Aún no se han subido certificados de asistencia." />
                )}
            </div>
        </div>
    );
}
