import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Pressable,
    Alert,
    Modal,
    KeyboardAvoidingView,
    Platform,
    Linking,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    FileText,
    Upload,
    Trash2,
    Download,
    Plus,
    X,
    Tag,
    Type as TypeIcon,
} from 'lucide-react-native';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { theme } from '../../theme';
import { documentsService } from '../../services/documentsService';
import { InfoDocument } from '../../types';
import { EmptyState } from '../../components/EmptyState';
import { Button } from '../../components/Button';
import { FormInput } from '../../components/FormInput';

function formatBytes(bytes: number | null) {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminInfoScreen() {
    const qc = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('General');

    const { data: docs, isLoading, refetch } = useQuery({
        queryKey: ['info-docs'],
        queryFn: documentsService.getDocuments,
    });

    const uploadMutation = useMutation({
        mutationFn: () =>
            documentsService.pickAndUploadInfoDocument(
                title.trim() || 'Documento',
                category.trim() || 'General'
            ),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['info-docs'] });
            setShowForm(false);
            setTitle('');
            setCategory('General');
            Alert.alert('Subido', 'Documento publicado correctamente.');
        },
        onError: (e: any) => {
            if (e.message !== 'No se seleccionó ningún archivo') {
                Alert.alert('Error', e.message);
            }
        },
    });

    async function handleDownload(doc: InfoDocument) {
        try {
            const url = await documentsService.getDownloadUrl(doc.url);
            await Linking.openURL(url);
        } catch (e: any) {
            Alert.alert('Error', e.message);
        }
    }

    function handleDelete(doc: InfoDocument) {
        Alert.alert('Eliminar', `¿Eliminar "${doc.title}"? Desaparecerá para todos los voluntarios.`, [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Eliminar',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await documentsService.deleteDocument(doc);
                        qc.invalidateQueries({ queryKey: ['info-docs'] });
                    } catch (e: any) {
                        Alert.alert('Error', e.message);
                    }
                },
            },
        ]);
    }

    function handleTapUpload() {
        if (!title.trim()) {
            Alert.alert('Título requerido', 'Añade un título para el documento.');
            return;
        }
        uploadMutation.mutate();
    }

    const renderItem = ({ item }: { item: InfoDocument }) => (
        <View style={styles.card}>
            <View style={styles.cardTop}>
                <View style={styles.fileIcon}>
                    <FileText size={18} color={theme.colors.primaryDark} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.docTitle} numberOfLines={2}>{item.title}</Text>
                    <View style={styles.metaRow}>
                        <View style={styles.catPill}>
                            <Text style={styles.catText}>{item.category}</Text>
                        </View>
                        <Text style={styles.metaText}>
                            {format(new Date(item.created_at), "d MMM yyyy", { locale: es })}
                        </Text>
                        {item.file_size ? (
                            <Text style={styles.metaText}>· {formatBytes(item.file_size)}</Text>
                        ) : null}
                    </View>
                </View>
            </View>
            <View style={styles.cardActions}>
                <Pressable
                    onPress={() => handleDownload(item)}
                    style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
                >
                    <Download size={16} color={theme.colors.primaryDark} />
                    <Text style={styles.actionText}>Ver</Text>
                </Pressable>
                <Pressable
                    onPress={() => handleDelete(item)}
                    style={({ pressed }) => [
                        styles.actionBtn,
                        { backgroundColor: theme.colors.errorSoft },
                        pressed && { opacity: 0.8 },
                    ]}
                >
                    <Trash2 size={16} color={theme.colors.error} />
                    <Text style={[styles.actionText, { color: theme.colors.error }]}>Eliminar</Text>
                </Pressable>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <FlatList
                data={docs}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                onRefresh={refetch}
                refreshing={isLoading}
                ListHeaderComponent={
                    <View style={styles.header}>
                        <Text style={styles.title}>Información del voluntariado</Text>
                        <Text style={styles.subtitle}>
                            Archivos visibles para todos los voluntarios
                        </Text>
                    </View>
                }
                ListEmptyComponent={
                    <EmptyState
                        icon="📄"
                        title="Sin documentos"
                        subtitle="Sube archivos para que los voluntarios puedan consultarlos."
                    />
                }
            />

            <Pressable
                style={({ pressed }) => [styles.fab, pressed && { opacity: 0.9 }]}
                onPress={() => setShowForm(true)}
            >
                <Plus color="#fff" size={20} strokeWidth={2.6} />
                <Text style={styles.fabText}>Subir archivo</Text>
            </Pressable>

            <Modal
                visible={showForm}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowForm(false)}
            >
                <KeyboardAvoidingView
                    style={{ flex: 1, backgroundColor: theme.colors.background }}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Nuevo documento</Text>
                        <Pressable
                            onPress={() => setShowForm(false)}
                            style={styles.modalClose}
                        >
                            <X size={18} color={theme.colors.textSecondary} />
                        </Pressable>
                    </View>

                    <View style={styles.modalBody}>
                        <Text style={styles.modalHint}>
                            Añade un título y una categoría. Después elige el archivo desde tu dispositivo.
                        </Text>
                        <FormInput
                            label="Título"
                            placeholder="Ej. Protocolo de voluntariado 2026"
                            value={title}
                            onChangeText={setTitle}
                            leftIcon={<TypeIcon size={16} color={theme.colors.textTertiary} />}
                        />
                        <FormInput
                            label="Categoría"
                            placeholder="General, Formación, Normativa..."
                            value={category}
                            onChangeText={setCategory}
                            leftIcon={<Tag size={16} color={theme.colors.textTertiary} />}
                        />
                    </View>

                    <View style={styles.modalFooter}>
                        <Button
                            title={uploadMutation.isPending ? 'Subiendo...' : 'Elegir archivo y subir'}
                            onPress={handleTapUpload}
                            loading={uploadMutation.isPending}
                            leftIcon={<Upload size={16} color="#fff" />}
                            fullWidth
                        />
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    list: { padding: 14, paddingBottom: 120 },
    header: {
        paddingHorizontal: 4,
        paddingBottom: 14,
    },
    title: {
        ...theme.typography.h2,
        color: theme.colors.text,
    },
    subtitle: {
        ...theme.typography.bodySmall,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },

    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: 14,
        marginBottom: 10,
    },
    cardTop: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    fileIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: theme.colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    docTitle: {
        ...theme.typography.bodyStrong,
        color: theme.colors.text,
        marginBottom: 4,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flexWrap: 'wrap',
    },
    catPill: {
        backgroundColor: theme.colors.primaryLight,
        paddingHorizontal: 7,
        paddingVertical: 2,
        borderRadius: theme.radius.pill,
    },
    catText: {
        fontSize: 10.5,
        fontWeight: '700',
        color: theme.colors.primaryDark,
        letterSpacing: 0.3,
    },
    metaText: {
        fontSize: 11.5,
        color: theme.colors.textSecondary,
        fontWeight: '500',
    },
    cardActions: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 10,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingVertical: 7,
        paddingHorizontal: 12,
        borderRadius: theme.radius.sm,
        backgroundColor: theme.colors.primaryLight,
    },
    actionBtnPressed: {
        opacity: 0.8,
    },
    actionText: {
        fontSize: 12,
        fontWeight: '700',
        color: theme.colors.primaryDark,
    },

    fab: {
        position: 'absolute',
        bottom: 20,
        left: 16,
        right: 16,
        backgroundColor: theme.colors.primary,
        borderRadius: theme.radius.md,
        paddingVertical: 13,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        ...theme.shadow.md,
    },
    fabText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },

    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 18,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
    },
    modalTitle: { ...theme.typography.h3, color: theme.colors.text },
    modalClose: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.surfaceAlt,
    },
    modalBody: {
        padding: 18,
        gap: 14,
    },
    modalHint: {
        ...theme.typography.bodySmall,
        color: theme.colors.textSecondary,
        lineHeight: 18,
    },
    modalFooter: {
        padding: 18,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
    },
});
