import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { FileText, Upload, Trash2, Download, Plus, X, Tag, Type as TypeIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { theme } from '../../theme';
import { documentsService } from '../../services/documentsService';
import type { InfoDocument } from '../../types';
import { EmptyState } from '../../components/EmptyState';
import { Button } from '../../components/Button';
import { FormInput } from '../../components/FormInput';
import { AdminHeader } from '../../components/AdminHeader';

function formatBytes(bytes: number | null) {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AdminInfoPage() {
    const qc = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('General');

    const { data: docs, isLoading } = useQuery({
        queryKey: ['info-docs'],
        queryFn: documentsService.getDocuments,
    });

    const uploadMutation = useMutation({
        mutationFn: () => documentsService.pickAndUploadInfoDocument(title.trim() || 'Documento', category.trim() || 'General'),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['info-docs'] });
            setShowForm(false);
            setTitle('');
            setCategory('General');
            toast.success('Subido', { description: 'Documento publicado correctamente.' });
        },
        onError: (e: any) => {
            if (e.message !== 'No se seleccionó ningún archivo') {
                toast.error('Error', { description: e.message });
            }
        },
    });

    async function handleDownload(doc: InfoDocument) {
        try {
            const url = await documentsService.getDownloadUrl(doc.url);
            window.open(url, '_blank', 'noopener,noreferrer');
        } catch (e: any) {
            toast.error('Error', { description: e.message });
        }
    }

    async function handleDelete(doc: InfoDocument) {
        if (!window.confirm(`¿Eliminar "${doc.title}"? Desaparecerá para todos los voluntarios.`)) return;
        try {
            await documentsService.deleteDocument(doc);
            qc.invalidateQueries({ queryKey: ['info-docs'] });
        } catch (e: any) {
            toast.error('Error', { description: e.message });
        }
    }

    function handleTapUpload() {
        if (!title.trim()) {
            toast.error('Título requerido', { description: 'Añade un título para el documento.' });
            return;
        }
        uploadMutation.mutate();
    }

    return (
        <div style={{ flex: 1, backgroundColor: theme.colors.background, display: 'flex', flexDirection: 'column', overflowY: 'auto', position: 'relative' }}>
            <AdminHeader title="Información" back />

            <div style={{ padding: '14px 14px 120px' }}>
                <div style={{ paddingBottom: 14, paddingLeft: 4 }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: theme.colors.text, letterSpacing: -0.2 }}>
                        Información del voluntariado
                    </div>
                    <div style={{ fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 }}>
                        Archivos visibles para todos los voluntarios
                    </div>
                </div>

                {isLoading ? (
                    <div style={{ textAlign: 'center', color: theme.colors.textSecondary, padding: 24 }}>Cargando…</div>
                ) : docs && docs.length > 0 ? (
                    docs.map((item) => (
                        <div
                            key={item.id}
                            style={{
                                backgroundColor: theme.colors.surface,
                                borderRadius: theme.radius.lg,
                                border: `1px solid ${theme.colors.border}`,
                                padding: 14,
                                marginBottom: 10,
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                <div
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 12,
                                        backgroundColor: theme.colors.primaryLight,
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        flexShrink: 0,
                                    }}
                                >
                                    <FileText size={18} color={theme.colors.primaryDark} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: theme.colors.text, marginBottom: 4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                        {item.title}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                        <span style={{ backgroundColor: theme.colors.primaryLight, padding: '2px 7px', borderRadius: 9999, fontSize: 10.5, fontWeight: 700, color: theme.colors.primaryDark, letterSpacing: 0.3 }}>
                                            {item.category}
                                        </span>
                                        <span style={{ fontSize: 11.5, color: theme.colors.textSecondary, fontWeight: 500 }}>
                                            {format(new Date(item.created_at), 'd MMM yyyy', { locale: es })}
                                        </span>
                                        {item.file_size ? (
                                            <span style={{ fontSize: 11.5, color: theme.colors.textSecondary, fontWeight: 500 }}>
                                                · {formatBytes(item.file_size)}
                                            </span>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                                <button onClick={() => handleDownload(item)} style={actionBtnStyle}>
                                    <Download size={16} color={theme.colors.primaryDark} />
                                    <span style={{ fontSize: 12, fontWeight: 700, color: theme.colors.primaryDark }}>Ver</span>
                                </button>
                                <button onClick={() => handleDelete(item)} style={{ ...actionBtnStyle, backgroundColor: theme.colors.errorSoft }}>
                                    <Trash2 size={16} color={theme.colors.error} />
                                    <span style={{ fontSize: 12, fontWeight: 700, color: theme.colors.error }}>Eliminar</span>
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <EmptyState icon="📄" title="Sin documentos" subtitle="Sube archivos para que los voluntarios puedan consultarlos." />
                )}
            </div>

            <button
                onClick={() => setShowForm(true)}
                style={{
                    position: 'fixed',
                    bottom: 'calc(20px + env(safe-area-inset-bottom, 0px))',
                    left: 'max(16px, calc((100vw - 520px) / 2 + 16px))',
                    right: 'max(16px, calc((100vw - 520px) / 2 + 16px))',
                    backgroundColor: theme.colors.primary,
                    borderRadius: theme.radius.md,
                    padding: '13px 24px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 8,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 6px 16px rgba(26,36,22,0.25)',
                    zIndex: 15,
                }}
            >
                <Plus color="#fff" size={20} strokeWidth={2.6} />
                <span style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>Subir archivo</span>
            </button>

            {showForm && (
                <div
                    style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
                    onClick={() => setShowForm(false)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: '100%',
                            maxWidth: 520,
                            maxHeight: '92dvh',
                            backgroundColor: theme.colors.background,
                            borderTopLeftRadius: 20,
                            borderTopRightRadius: 20,
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 18, borderBottom: `1px solid ${theme.colors.border}`, backgroundColor: theme.colors.surface }}>
                            <div style={{ fontSize: 17, fontWeight: 700, color: theme.colors.text }}>Nuevo documento</div>
                            <button
                                onClick={() => setShowForm(false)}
                                style={{
                                    width: 32,
                                    height: 32,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: 16,
                                    backgroundColor: theme.colors.surfaceAlt,
                                    border: 'none',
                                    cursor: 'pointer',
                                }}
                            >
                                <X size={18} color={theme.colors.textSecondary} />
                            </button>
                        </div>
                        <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>
                            <div style={{ fontSize: 13, color: theme.colors.textSecondary, lineHeight: '18px' }}>
                                Añade un título y una categoría. Después elige el archivo desde tu dispositivo.
                            </div>
                            <FormInput
                                label="Título"
                                placeholder="Ej. Protocolo de voluntariado 2026"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                leftIcon={<TypeIcon size={16} color={theme.colors.textTertiary} />}
                            />
                            <FormInput
                                label="Categoría"
                                placeholder="General, Formación, Normativa..."
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                leftIcon={<Tag size={16} color={theme.colors.textTertiary} />}
                            />
                        </div>
                        <div style={{ padding: 18, borderTop: `1px solid ${theme.colors.border}`, backgroundColor: theme.colors.surface }}>
                            <Button
                                title={uploadMutation.isPending ? 'Subiendo...' : 'Elegir archivo y subir'}
                                onPress={handleTapUpload}
                                loading={uploadMutation.isPending}
                                leftIcon={<Upload size={16} color="#fff" />}
                                fullWidth
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const actionBtnStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '7px 12px',
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.primaryLight,
    border: 'none',
    cursor: 'pointer',
};
