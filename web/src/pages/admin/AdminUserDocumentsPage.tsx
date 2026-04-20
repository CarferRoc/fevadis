import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { FileText, Download } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { documentService, type UserDocument } from '../../services/documentService';
import { EmptyState } from '../../components/EmptyState';
import { AdminHeader } from '../../components/AdminHeader';
import { theme } from '../../theme';

function formatBytes(bytes: number | null) {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AdminUserDocumentsPage() {
    const { userId } = useParams<{ userId: string }>();
    const [search] = useSearchParams();
    const userName = search.get('name') ?? 'usuario';

    const { data: docs, isLoading } = useQuery({
        queryKey: ['admin-user-docs', userId],
        queryFn: () => documentService.getUserDocuments(userId!),
        enabled: !!userId,
    });

    async function handleDownload(doc: UserDocument) {
        try {
            const url = await documentService.getDocumentDownloadUrl(doc.storage_path);
            window.open(url, '_blank', 'noopener,noreferrer');
        } catch (e: any) {
            toast.error('Error', { description: e.message });
        }
    }

    return (
        <div style={{ flex: 1, backgroundColor: theme.colors.background, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <AdminHeader title={`Archivos de ${userName}`} back />
            <div style={{ padding: 12 }}>
                {isLoading ? (
                    <div style={{ textAlign: 'center', color: theme.colors.textSecondary, padding: 24 }}>Cargando…</div>
                ) : docs && docs.length > 0 ? (
                    docs.map((item) => (
                        <div
                            key={item.id}
                            style={{
                                backgroundColor: theme.colors.surface,
                                borderRadius: theme.radius.lg,
                                padding: 12,
                                marginBottom: 8,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                boxShadow: '0 2px 6px rgba(26,36,22,0.05)',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                                <div
                                    style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 12,
                                        backgroundColor: theme.colors.primary + '15',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        flexShrink: 0,
                                    }}
                                >
                                    <FileText size={22} color={theme.colors.primary} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: theme.colors.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {item.filename}
                                    </div>
                                    <div style={{ fontSize: 12, color: theme.colors.textSecondary, marginTop: 3 }}>
                                        {format(new Date(item.created_at), 'd MMM yyyy', { locale: es })}
                                        {item.file_size ? `  ·  ${formatBytes(item.file_size)}` : ''}
                                    </div>
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
                    ))
                ) : (
                    <EmptyState icon="📁" title="Sin documentos" subtitle={`${userName} no ha subido ningún documento aún.`} />
                )}
            </div>
        </div>
    );
}
