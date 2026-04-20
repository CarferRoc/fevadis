import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Download } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { documentService, type Certificate } from '../../services/documentService';
import { EmptyState } from '../../components/EmptyState';
import { AdminHeader } from '../../components/AdminHeader';
import { theme } from '../../theme';

export function AdminActivityAttendeesPage() {
    const { activityId } = useParams<{ activityId: string }>();
    const [search] = useSearchParams();
    const activityTitle = search.get('title') ?? 'Asistentes';

    const { data: certs, isLoading } = useQuery({
        queryKey: ['certs-activity', activityId],
        queryFn: () => documentService.getCertificatesForActivity(activityId!),
        enabled: !!activityId,
    });

    async function handleDownload(cert: Certificate) {
        try {
            const url = await documentService.getCertificateDownloadUrl(cert.storage_path);
            window.open(url, '_blank', 'noopener,noreferrer');
        } catch (e: any) {
            toast.error('Error', { description: e.message });
        }
    }

    return (
        <div style={{ flex: 1, backgroundColor: theme.colors.background, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <AdminHeader title={activityTitle} back />
            <div style={{ padding: 12 }}>
                {isLoading ? (
                    <div style={{ textAlign: 'center', color: theme.colors.textSecondary, padding: 24 }}>Cargando…</div>
                ) : certs && certs.length > 0 ? (
                    certs.map((item) => {
                        const name = `${item.profile?.nombre ?? ''} ${item.profile?.apellidos ?? ''}`.trim();
                        return (
                            <div
                                key={item.id}
                                style={{
                                    backgroundColor: theme.colors.surface,
                                    borderRadius: theme.radius.lg,
                                    padding: 12,
                                    marginBottom: 8,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    boxShadow: '0 2px 6px rgba(26,36,22,0.05)',
                                }}
                            >
                                <div
                                    style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 22,
                                        backgroundColor: theme.colors.primary,
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        flexShrink: 0,
                                    }}
                                >
                                    <span style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{name[0] ?? '?'}</span>
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: theme.colors.text }}>{name || 'Usuario'}</div>
                                    <div style={{ fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 }}>{item.profile?.dni}</div>
                                    <div style={{ fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 }}>
                                        {format(new Date(item.created_at), 'd MMM yyyy', { locale: es })}
                                        {'  ·  '}
                                        {item.filename}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDownload(item)}
                                    style={{
                                        backgroundColor: theme.colors.primary,
                                        borderRadius: theme.radius.md,
                                        padding: 10,
                                        border: 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                    }}
                                    aria-label="Descargar"
                                >
                                    <Download size={18} color="#fff" />
                                </button>
                            </div>
                        );
                    })
                ) : (
                    <EmptyState icon="🏅" title="Sin asistentes" subtitle="Ningún certificado subido para esta actividad." />
                )}
            </div>
        </div>
    );
}
