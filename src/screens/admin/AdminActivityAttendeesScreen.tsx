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
import { documentService, Certificate } from '../../services/documentService';
import { theme } from '../../theme';
import { EmptyState } from '../../components/EmptyState';
import { FileText, Download } from 'lucide-react-native';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AdminActivityAttendeesScreen() {
    const route = useRoute();
    const { activityId, activityTitle } = route.params as { activityId: string; activityTitle: string };

    const { data: certs, isLoading, refetch } = useQuery({
        queryKey: ['certs-activity', activityId],
        queryFn: () => documentService.getCertificatesForActivity(activityId),
    });

    async function handleDownload(cert: Certificate) {
        try {
            const url = await documentService.getCertificateDownloadUrl(cert.storage_path);
            await Linking.openURL(url);
        } catch (e: any) {
            Alert.alert('Error', e.message);
        }
    }

    const renderItem = ({ item }: { item: Certificate }) => {
        const name = `${item.profile?.nombre ?? ''} ${item.profile?.apellidos ?? ''}`.trim();
        return (
            <View style={styles.card}>
                <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>{name[0] ?? '?'}</Text>
                </View>
                <View style={styles.info}>
                    <Text style={styles.name}>{name || 'Usuario'}</Text>
                    <Text style={styles.meta}>{item.profile?.dni}</Text>
                    <Text style={styles.meta}>
                        {format(new Date(item.created_at), "d MMM yyyy", { locale: es })}
                        {'  ·  '}{item.filename}
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.downloadBtn}
                    onPress={() => handleDownload(item)}
                    activeOpacity={0.8}
                >
                    <Download size={18} color="#fff" />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={certs ?? []}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                onRefresh={refetch}
                refreshing={isLoading}
                ListEmptyComponent={
                    <EmptyState
                        icon="🏅"
                        title="Sin asistentes"
                        subtitle="Ningún certificado subido para esta actividad."
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
        gap: 12,
        ...theme.shadow.sm,
    },
    avatarCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: { fontSize: 18, fontWeight: '800', color: '#fff' },
    info: { flex: 1 },
    name: { ...theme.typography.h4, color: theme.colors.text },
    meta: { ...theme.typography.caption, color: theme.colors.textSecondary, marginTop: 2 },
    downloadBtn: {
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.md,
        padding: 10,
    },
});
