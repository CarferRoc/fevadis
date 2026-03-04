import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { documentService } from '../../services/documentService';
import { theme } from '../../theme';
import { EmptyState } from '../../components/EmptyState';
import { Folder, ChevronRight, Users } from 'lucide-react-native';
import { AdminStackParamList } from '../../types/navigation';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

export default function AdminCertificatesScreen() {
    const navigation = useNavigation<Nav>();

    const { data: folders, isLoading, refetch } = useQuery({
        queryKey: ['cert-folders'],
        queryFn: documentService.getCertificatesByActivity,
    });

    const renderItem = ({ item }: { item: { activity: { id: string; titulo: string }; count: number } }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => (navigation as any).navigate('AdminActivityAttendees', {
                activityId: item.activity.id,
                activityTitle: item.activity.titulo,
            })}
            activeOpacity={0.8}
        >
            <View style={styles.folderIcon}>
                <Folder size={28} color={theme.colors.catCampamentos} />
            </View>
            <View style={styles.info}>
                <Text style={styles.title} numberOfLines={1}>{item.activity.titulo}</Text>
                <View style={styles.countRow}>
                    <Users size={13} color={theme.colors.textSecondary} />
                    <Text style={styles.count}>{item.count} asistente{item.count !== 1 ? 's' : ''}</Text>
                </View>
            </View>
            <ChevronRight size={18} color={theme.colors.textTertiary} />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={folders ?? []}
                keyExtractor={(item) => item.activity.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                onRefresh={refetch}
                refreshing={isLoading}
                ListEmptyComponent={
                    <EmptyState
                        icon="📂"
                        title="Sin certificados"
                        subtitle="Aún no se han subido certificados de asistencia."
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
        gap: 14,
        ...theme.shadow.sm,
    },
    folderIcon: {
        width: 52,
        height: 52,
        borderRadius: 14,
        backgroundColor: theme.colors.catCampamentos + '15',
        justifyContent: 'center',
        alignItems: 'center',
    },
    info: { flex: 1 },
    title: { ...theme.typography.h4, color: theme.colors.text },
    countRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
    count: { ...theme.typography.bodySmall, color: theme.colors.textSecondary },
});
