import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Upload, Trash2, Download, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuthStore } from '../../store/useAuthStore';
import { documentService, type UserDocument } from '../../services/documentService';
import { Header } from '../../components/Header';
import { EmptyState } from '../../components/EmptyState';
import { theme } from '../../theme';

function formatBytes(bytes: number | null) {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UserDocumentsPage() {
    const { user } = useAuthStore();
    const qc = useQueryClient();

    const { data: docs, isLoading } = useQuery({
        queryKey: ['user-docs', user?.id],
        queryFn: () => documentService.getUserDocuments(user!.id),
        enabled: !!user?.id,
    });

    const uploadMutation = useMutation({
        mutationFn: () => documentService.pickAndUploadDocument(user!.id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['user-docs', user?.id] });
            toast.success('Documento subido', { description: 'El archivo se ha subido correctamente.' });
        },
        onError: (e: any) => {
            if (e.message !== 'No se seleccionó ningún archivo') {
                toast.error('Error', { description: e.message });
            }
        },
    });

    async function handleDownload(doc: UserDocument) {
        try {
            const url = await documentService.getDocumentDownloadUrl(doc.storage_path);
            window.open(url, '_blank', 'noopener,noreferrer');
        } catch (e: any) {
            toast.error('Error', { description: e.message });
        }
    }

    async function handleDelete(doc: UserDocument) {
        if (!window.confirm(`¿Eliminar "${doc.filename}"?`)) return;
        try {
            await documentService.deleteUserDocument(doc);
            qc.invalidateQueries({ queryKey: ['user-docs', user?.id] });
        } catch (e: any) {
            toast.error('Error', { description: e.message });
        }
    }

    return (
        <div style={{ flex: 1, backgroundColor: theme.colors.background, display: 'flex', flexDirection: 'column', overflowY: 'auto', position: 'relative' }}>
            <Header title="Mis Documentos" back />

            <div style={{ padding: 12, paddingBottom: 100 }}>
                {docs && docs.length > 0 ? (
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
                                    <div style={{ fontSize: 14, fontWeight: 600, color: theme.colors.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {item.filename}
                                    </div>
                                    <div style={{ fontSize: 12, color: theme.colors.textSecondary, marginTop: 3 }}>
                                        {format(new Date(item.created_at), 'd MMM yyyy', { locale: es })}
                                        {item.file_size ? `  ·  ${formatBytes(item.file_size)}` : ''}
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                                <button onClick={() => handleDownload(item)} style={iconBtnStyle} aria-label="Descargar">
                                    <Download size={18} color={theme.colors.primary} />
                                </button>
                                <button onClick={() => handleDelete(item)} style={iconBtnStyle} aria-label="Eliminar">
                                    <Trash2 size={18} color={theme.colors.error} />
                                </button>
                            </div>
                        </div>
                    ))
                ) : isLoading ? null : (
                    <EmptyState icon="📁" title="Sin documentos" subtitle="Sube archivos para que los administradores puedan verlos." />
                )}
            </div>

            <button
                onClick={() => uploadMutation.mutate()}
                disabled={uploadMutation.isPending}
                style={{
                    position: 'fixed',
                    bottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
                    left: 'max(20px, calc((100vw - 520px) / 2 + 20px))',
                    right: 'max(20px, calc((100vw - 520px) / 2 + 20px))',
                    backgroundColor: theme.colors.primary,
                    borderRadius: 9999,
                    padding: '14px 24px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 10,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 6px 16px rgba(26,36,22,0.2)',
                    zIndex: 15,
                }}
            >
                <Upload size={22} color="#fff" />
                <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>
                    {uploadMutation.isPending ? 'Subiendo...' : 'Subir archivo'}
                </span>
            </button>
        </div>
    );
}

const iconBtnStyle: React.CSSProperties = {
    padding: 10,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
};
