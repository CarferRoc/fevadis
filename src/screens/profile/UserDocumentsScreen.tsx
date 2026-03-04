import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Alert,
    TouchableOpacity,
    Linking,
    Platform,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/useAuthStore';
import { documentService, UserDocument } from '../../services/documentService';
import { theme } from '../../theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '../../components/EmptyState';
import { FolderOpen, Upload, Trash2, Download, FileText } from 'lucide-react-native';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

function formatBytes(bytes: number | null) {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UserDocumentsScreen() {
    const { user } = useAuthStore();
    const qc = useQueryClient();

    const { data: docs, isLoading, refetch } = useQuery({
        queryKey: ['user-docs', user?.id],
        queryFn: () => documentService.getUserDocuments(user!.id),
        enabled: !!user?.id,
    });

    const uploadMutation = useMutation({
        mutationFn: () => documentService.pickAndUploadDocument(user!.id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['user-docs', user?.id] });
            Alert.alert('✅ Documento subido', 'El archivo se ha subido correctamente.');
        },
        onError: (e: any) => {
            if (e.message !== 'No se seleccionó ningún archivo') {
                Alert.alert('Error', e.message);
            }
        },
    });

    async function handleDownload(doc: UserDocument) {
        try {
            const url = await documentService.getDocumentDownloadUrl(doc.storage_path);
            await Linking.openURL(url);
        } catch (e: any) {
            Alert.alert('Error', e.message);
        }
    }

    async function handleDelete(doc: UserDocument) {
        Alert.alert(
            'Eliminar documento',
            `¿Eliminar "${doc.filename}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await documentService.deleteUserDocument(doc);
                            qc.invalidateQueries({ queryKey: ['user-docs', user?.id] });
                        } catch (e: any) {
                            Alert.alert('Error', e.message);
                        }
                    },
                },
            ]
        );
    }

    const renderItem = ({ item }: { item: UserDocument }) => (
        <View style={styles.card}>
            <View style={styles.cardLeft}>
                <View style={styles.fileIcon}>
                    <FileText size={22} color={theme.colors.primary} />
                </View>
                <View style={styles.fileInfo}>
                    <Text style={styles.fileName} numberOfLines={1}>{item.filename}</Text>
                    <Text style={styles.fileMeta}>
                        {format(new Date(item.created_at), "d MMM yyyy", { locale: es })}
                        {item.file_size ? `  ·  ${formatBytes(item.file_size)}` : ''}
                    </Text>
                </View>
            </View>
            <View style={styles.cardActions}>
                <TouchableOpacity onPress={() => handleDownload(item)} style={styles.actionBtn}>
                    <Download size={18} color={theme.colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item)} style={styles.actionBtn}>
                    <Trash2 size={18} color={theme.colors.error} />
                </TouchableOpacity>
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
                ListEmptyComponent={
                    <EmptyState
                        icon="📁"
                        title="Sin documentos"
                        subtitle="Sube archivos para que los administradores puedan verlos."
                    />
                }
            />

            {/* FAB subir */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => uploadMutation.mutate()}
                disabled={uploadMutation.isPending}
                activeOpacity={0.8}
            >
                <Upload size={22} color="#fff" />
                <Text style={styles.fabText}>
                    {uploadMutation.isPending ? 'Subiendo...' : 'Subir archivo'}
                </Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    list: { padding: theme.spacing.md, paddingBottom: 100 },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        ...theme.shadow.sm,
    },
    cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    fileIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: theme.colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fileInfo: { flex: 1 },
    fileName: { ...theme.typography.h4, color: theme.colors.text, fontSize: 14 },
    fileMeta: { ...theme.typography.caption, color: theme.colors.textSecondary, marginTop: 3 },
    cardActions: { flexDirection: 'row', gap: 4 },
    actionBtn: { padding: 10 },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 20,
        left: 20,
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.full,
        paddingVertical: 14,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        ...theme.shadow.md,
    },
    fabText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
