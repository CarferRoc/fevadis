import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { FileText, Download, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { theme } from '../../theme';
import { documentsService } from '../../services/documentsService';
import type { InfoDocument } from '../../types';
import { Logo } from '../../components/Logo';
import { EmptyState } from '../../components/EmptyState';
import { useAuthStore } from '../../store/useAuthStore';

function formatBytes(bytes: number | null) {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function InfoPage() {
    const { isAdmin } = useAuthStore();
    const navigate = useNavigate();
    const [selectedCat, setSelectedCat] = useState<string>('Todas');

    const { data: docs, isLoading } = useQuery({
        queryKey: ['info-docs'],
        queryFn: documentsService.getDocuments,
    });

    const categories = useMemo(() => {
        const set = new Set<string>();
        (docs ?? []).forEach((d) => set.add(d.category));
        return ['Todas', ...Array.from(set).sort()];
    }, [docs]);

    const filteredDocs = useMemo(() => {
        if (!docs) return [];
        if (selectedCat === 'Todas') return docs;
        return docs.filter((d) => d.category === selectedCat);
    }, [docs, selectedCat]);

    async function handleDownload(doc: InfoDocument) {
        try {
            const url = await documentsService.getDownloadUrl(doc.url);
            window.open(url, '_blank', 'noopener,noreferrer');
        } catch (e: any) {
            toast.error('Error', { description: e.message });
        }
    }

    return (
        <div style={{ flex: 1, backgroundColor: theme.colors.background, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 18px 10px', paddingTop: 'calc(env(safe-area-inset-top, 0px) + 8px)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Logo size={24} />
                    <span style={{ fontSize: 17, fontWeight: 800, color: theme.colors.text, letterSpacing: -0.3 }}>Información</span>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => navigate('/admin/info')}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            backgroundColor: theme.colors.primaryLight,
                            padding: '6px 11px',
                            borderRadius: 9999,
                            border: 'none',
                            cursor: 'pointer',
                        }}
                    >
                        <Plus size={14} color={theme.colors.primaryDark} strokeWidth={2.6} />
                        <span style={{ fontSize: 12, fontWeight: 700, color: theme.colors.primaryDark }}>Subir</span>
                    </button>
                )}
            </div>

            <div style={{ padding: '0 18px 14px' }}>
                <div style={{ fontSize: 30, fontWeight: 800, color: theme.colors.text, letterSpacing: -0.6, lineHeight: '36px' }}>
                    Documentos del voluntariado
                </div>
                <div style={{ fontSize: 13, color: theme.colors.textSecondary, marginTop: 4, maxWidth: 360 }}>
                    Archivos y materiales publicados por el equipo de FEVADIS. Toca cualquier elemento para verlo o descargarlo.
                </div>
            </div>

            {(docs?.length ?? 0) > 0 && categories.length > 2 && (
                <div
                    className="hide-scrollbar"
                    style={{
                        display: 'flex',
                        gap: 6,
                        padding: '6px 18px',
                        overflowX: 'auto',
                        whiteSpace: 'nowrap',
                        maxHeight: 44,
                    }}
                >
                    {categories.map((cat) => {
                        const active = selectedCat === cat;
                        return (
                            <button
                                key={cat}
                                onClick={() => setSelectedCat(cat)}
                                style={{
                                    padding: '7px 14px',
                                    borderRadius: 9999,
                                    backgroundColor: active ? theme.colors.text : theme.colors.surface,
                                    border: `1px solid ${active ? theme.colors.text : theme.colors.border}`,
                                    color: active ? '#fff' : theme.colors.textSecondary,
                                    fontSize: 12.5,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            >
                                {cat}
                            </button>
                        );
                    })}
                </div>
            )}

            <div style={{ padding: '8px 14px 40px' }}>
                {filteredDocs.length > 0 ? (
                    filteredDocs.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => handleDownload(item)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                backgroundColor: theme.colors.surface,
                                borderRadius: theme.radius.lg,
                                border: `1px solid ${theme.colors.border}`,
                                padding: 12,
                                marginBottom: 8,
                                cursor: 'pointer',
                            }}
                        >
                            <div
                                style={{
                                    width: 38,
                                    height: 38,
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
                                <div style={{ fontSize: 14, fontWeight: 600, color: theme.colors.text, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
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
                            <div
                                style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 10,
                                    backgroundColor: theme.colors.primarySoft,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                <Download size={16} color={theme.colors.primaryDark} />
                            </div>
                        </div>
                    ))
                ) : isLoading ? null : (
                    <EmptyState
                        icon="📄"
                        title="Sin documentos"
                        subtitle={isAdmin ? 'Aún no hay archivos. Usa "Subir" para publicar el primero.' : 'Aquí aparecerán los archivos que publiquen los administradores.'}
                    />
                )}
            </div>
        </div>
    );
}
