import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../utils/supabase';
import { Screen } from '../../components/Screen';
import { theme } from '../../theme';
import { ActivityCard } from '../../components/ActivityCard';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';

export default function MyEnrollmentsScreen() {
    const { user } = useAuthStore();
    const navigation = useNavigation<any>();

    const { data: enrollments, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['my-enrollments', user?.id],
        queryFn: async () => {
            if (!user) return [];
            const { data, error } = await supabase
                .from('enrollments')
                .select(`
          *,
          activity:activities(*)
        `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        },
        enabled: !!user,
    });

    const onRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.cardContainer}>
            <View style={styles.statusBadge}>
                <Text style={[
                    styles.statusText,
                    {
                        color: item.status === 'accepted' ? theme.colors.success :
                            item.status === 'rejected' ? theme.colors.error : '#F59E0B'
                    }
                ]}>
                    {item.status.toUpperCase()}
                </Text>
            </View>
            <ActivityCard
                activity={item.activity}
                onPress={() => navigation.navigate('ActivityDetail', { id: item.activity.id })}
            />
        </View>
    );

    return (
        <Screen safeArea={false} style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Mis Inscripciones</Text>
            </View>

            <FlatList
                data={enrollments}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text>No tienes inscripciones aún.</Text>
                    </View>
                }
            />
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.background,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: theme.spacing.lg,
        paddingBottom: theme.spacing.md,
        backgroundColor: theme.colors.surface,
    },
    title: {
        ...theme.typography.h1,
        color: theme.colors.text,
    },
    listContent: {
        padding: theme.spacing.lg,
    },
    cardContainer: {
        marginBottom: theme.spacing.md,
    },
    statusBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1,
        backgroundColor: theme.colors.surface,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 3,
    },
    statusText: {
        fontWeight: '700',
        fontSize: 12,
    },
    empty: {
        alignItems: 'center',
        marginTop: 50,
    }
});
