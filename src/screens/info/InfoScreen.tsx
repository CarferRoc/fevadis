import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Pressable,
    Alert,
    Linking,
    RefreshControl,
    ScrollView,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { FileText, Download, Plus } from 'lucide-react-native';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { theme } from '../../theme';
import { documentsService } from '../../services/documentsService';
import { InfoDocument } from '../../types';
import { Logo } from '../../components/Logo';
import { EmptyState } from '../../components/EmptyState';
import { useAuthStore } from '../../store/useAuthStore';

function formatBytes(bytes: number | null) {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function InfoScreen() {
    const { isAdmin } = useAuthStore();
    const navigation = useNavigation<any>();
    const [selectedCat, setSelectedCat] = useState<string>('Todas');

    const { data: docs, isLoading, refetch, isRefetching } = useQuery({
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
            await Linking.openURL(url);
        } catch (e: any) {
            Alert.alert('Error', e.message);
        }
    }

    const renderItem = ({ item }: { item: InfoDocument }) => (
        <Pressable
            onPress={() => handleDownload(item)}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        >
            <View style={styles.fileIcon}>
                <FileText size={18} color={theme.colors.primaryDark} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.docTitle} numberOfLines={2}>
                    {item.title}
                </Text>
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
            <View style={styles.downloadIcon}>
                <Download size={16} color={theme.colors.primaryDark} />
            </View>
        </Pressable>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <View style={styles.brandRow}>
                    <Logo size={24} />
                    <Text style={styles.brand}>Información</Text>
                </View>
                {isAdmin && (
                    <Pressable
                        style={({ pressed }) => [styles.manageBtn, pressed && { opacity: 0.7 }]}
                        onPress={() =>
                            (navigation as any).navigate('Perfil', {
                                screen: 'AdminNavigator',
                                params: { screen: 'AdminInfo' },
                            })
                        }
                    >
                        <Plus size={14} color={theme.colors.primaryDark} strokeWidth={2.6} />
                        <Text style={styles.manageText}>Subir</Text>
                    </Pressable>
                )}
            </View>

            <View style={styles.heroBox}>
                <Text style={styles.heroTitle}>Documentos del voluntariado</Text>
                <Text style={styles.heroSub}>
                    Archivos y materiales publicados por el equipo de FEVADIS. Toca cualquier elemento para verlo o descargarlo.
                </Text>
            </View>

            {(docs?.length ?? 0) > 0 && categories.length > 2 && (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.chipsRow}
                    style={styles.chipsScroll}
                >
                    {categories.map((cat) => {
                        const active = selectedCat === cat;
                        return (
                            <Pressable
                                key={cat}
                                style={[styles.chip, active && styles.chipActive]}
                                onPress={() => setSelectedCat(cat)}
                            >
                                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                                    {cat}
                                </Text>
                            </Pressable>
                        );
                    })}
                </ScrollView>
            )}

            <FlatList
                data={filteredDocs}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={refetch}
                        tintColor={theme.colors.primary}
                        colors={[theme.colors.primary]}
                    />
                }
                ListEmptyComponent={
                    isLoading ? null : (
                        <EmptyState
                            icon="📄"
                            title="Sin documentos"
                            subtitle={
                                isAdmin
                                    ? 'Aún no hay archivos. Usa "Subir" para publicar el primero.'
                                    : 'Aquí aparecerán los archivos que publiquen los administradores.'
                            }
                        />
                    )
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingTop: 8,
        paddingBottom: 10,
    },
    brandRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    brand: {
        fontSize: 17,
        fontWeight: '800',
        color: theme.colors.text,
        letterSpacing: -0.3,
    },
    manageBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: theme.colors.primaryLight,
        paddingHorizontal: 11,
        paddingVertical: 6,
        borderRadius: theme.radius.pill,
    },
    manageText: {
        fontSize: 12,
        fontWeight: '700',
        color: theme.colors.primaryDark,
    },

    heroBox: {
        paddingHorizontal: 18,
        paddingBottom: 14,
    },
    heroTitle: {
        ...theme.typography.display,
        color: theme.colors.text,
    },
    heroSub: {
        ...theme.typography.bodySmall,
        color: theme.colors.textSecondary,
        marginTop: 4,
        maxWidth: 360,
    },

    chipsScroll: {
        maxHeight: 44,
    },
    chipsRow: {
        paddingHorizontal: 18,
        paddingVertical: 6,
        gap: 6,
    },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: theme.radius.pill,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    chipActive: {
        backgroundColor: theme.colors.text,
        borderColor: theme.colors.text,
    },
    chipText: {
        fontSize: 12.5,
        fontWeight: '600',
        color: theme.colors.textSecondary,
    },
    chipTextActive: {
        color: '#fff',
    },

    list: {
        paddingHorizontal: 14,
        paddingTop: 8,
        paddingBottom: 40,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: 12,
        marginBottom: 8,
    },
    cardPressed: {
        backgroundColor: theme.colors.primarySoft,
        borderColor: theme.colors.primaryLight,
    },
    fileIcon: {
        width: 38,
        height: 38,
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
    downloadIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: theme.colors.primarySoft,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
