import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Linking } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { documentsService } from '../../services/documentsService';
import { Screen } from '../../components/Screen';
import { theme } from '../../theme';
import { FileText, Download, Trash } from 'lucide-react-native';
import { useAuthStore } from '../../store/useAuthStore';
import * as DocumentPicker from 'expo-document-picker';

export default function DocumentsScreen() {
    const { profile } = useAuthStore();
    const [uploading, setUploading] = useState(false);

    const { data: documents, refetch, isLoading } = useQuery({
        queryKey: ['documents'],
        queryFn: documentsService.getDocuments,
    });

    async function handleDownload(url: string) {
        try {
            // For private buckets (signed url):
            const { data: signedData, error } = await documentsService.createSignedUrl(url, 60);
            if (error) throw error;
            if (signedData) Linking.openURL(signedData.signedUrl);

        } catch (e: any) {
            Alert.alert('Error', e.message);
        }
    }

    async function handleDelete(id: string, path: string) {
        if (profile?.role !== 'admin') return;

        try {
            await documentsService.deleteDocument(id, path);
            refetch();
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    }

    // Placeholder for upload logic
    const handleUpload = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
            if (result.canceled) return;

            setUploading(true);
            const file = result.assets[0];
            const title = file.name || 'Untitled Document';
            await documentsService.uploadDocument(file, title, 'General');

            Alert.alert('Success', 'Document uploaded');
            refetch();
        } catch (error: any) {
            Alert.alert('Error', 'Upload failed: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <View style={styles.iconContainer}>
                <FileText color={theme.colors.primary} size={24} />
            </View>
            <View style={styles.info}>
                <Text style={styles.name}>{item.title}</Text>
                <Text style={styles.meta}>{item.category} • {new Date(item.created_at).toLocaleDateString()}</Text>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity onPress={() => handleDownload(item.url)} style={styles.actionBtn}>
                    <Download color={theme.colors.textSecondary} size={20} />
                </TouchableOpacity>
                {profile?.role === 'admin' && (
                    <TouchableOpacity onPress={() => handleDelete(item.id, item.url)} style={styles.actionBtn}>
                        <Trash color={theme.colors.error} size={20} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    return (
        <Screen safeArea={false} style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Documentos</Text>
                {profile?.role === 'admin' && (
                    <TouchableOpacity onPress={handleUpload} style={styles.uploadBtn}>
                        <Text style={styles.uploadText}>+ Upload</Text>
                    </TouchableOpacity>
                )}
            </View>

            <FlatList
                data={documents}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                ListEmptyComponent={<Text style={styles.empty}>No documents found.</Text>}
            />
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: { backgroundColor: theme.colors.background },
    header: {
        paddingTop: 60,
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.surface,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: { ...theme.typography.h1 },
    uploadBtn: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: theme.borderRadius.full,
    },
    uploadText: { color: '#fff', fontWeight: '600', fontSize: 12 },
    list: { padding: theme.spacing.lg },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        marginBottom: theme.spacing.md,
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, elevation: 2
    },
    iconContainer: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.background,
        justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.md
    },
    info: { flex: 1 },
    name: { fontWeight: '600', fontSize: 16, color: theme.colors.text },
    meta: { color: theme.colors.textSecondary, fontSize: 12 },
    actions: { flexDirection: 'row', gap: 10 },
    actionBtn: { padding: 5 },
    empty: { textAlign: 'center', marginTop: 20, color: theme.colors.textSecondary }
});
