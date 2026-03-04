import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Alert,
    TouchableOpacity,
    Linking,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRoute } from '@react-navigation/native';
import { documentService, UserDocument } from '../../services/documentService';
import { theme } from '../../theme';
import { EmptyState } from '../../components/EmptyState';
import { FileText, Download } from 'lucide-react-native';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

function formatBytes(bytes: number | null) {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminUserDocumentsScreen() {
    const route = useRoute();
    const { userId, userName } = route.params as { userId: string; userName: string };

    const { data: docs, isLoading, refetch } = useQuery({
        queryKey: ['admin-user-docs', userId],
        queryFn: () => documentService.getUserDocuments(userId),
    });

    async function handleDownload(doc: UserDocument) {
        try {
            const url = await documentService.getDocumentDownloadUrl(doc.storage_path);
            await Linking.openURL(url);
        } catch (e: any) {
            Alert.alert('Error', e.message);
        }
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
            <TouchableOpacity onPress={() => handleDownload(item)} style={styles.downloadBtn}>
                <Download size={18} color="#fff" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
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
                        subtitle={`${userName} no ha subido ningún documento aún.`}
                    />
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    list: { padding: theme.spacing.md },
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
    downloadBtn: {
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.md,
        padding: 10,
    },
});
