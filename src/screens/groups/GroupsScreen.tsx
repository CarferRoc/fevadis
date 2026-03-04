import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { groupsService, Group } from '../../services/groupsService';
import { Screen } from '../../components/Screen';
import { theme } from '../../theme';
import { Users, Plus } from 'lucide-react-native';
import { useAuthStore } from '../../store/useAuthStore';

export default function GroupsScreen() {
    const navigation = useNavigation<any>();
    const { profile } = useAuthStore();
    const { data: groups, refetch, isLoading } = useQuery({
        queryKey: ['groups'],
        queryFn: groupsService.getGroups,
    });

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('GroupDetail', { groupId: item.id, title: item.name })}
        >
            <View style={styles.iconContainer}>
                <Users color={theme.colors.primary} size={24} />
            </View>
            <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.desc} numberOfLines={1}>{item.description}</Text>
                <Text style={styles.meta}>{item.group_members[0]?.count || 0} members</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <Screen safeArea={false} style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Grupos</Text>
                {(profile?.role === 'admin' || profile?.role === 'editor') && (
                    <TouchableOpacity
                        onPress={() => navigation.navigate('CreateGroup')}
                        style={styles.fab}
                    >
                        <Plus color="#fff" size={24} />
                    </TouchableOpacity>
                )}
            </View>

            <FlatList
                data={groups}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                ListEmptyComponent={<Text style={styles.empty}>No groups found.</Text>}
                onRefresh={refetch}
                refreshing={isLoading}
            />
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: { backgroundColor: theme.colors.background, flex: 1 },
    header: {
        paddingTop: 60,
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.surface,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: { ...theme.typography.h1 },
    fab: {
        backgroundColor: theme.colors.primary,
        width: 40, height: 40, borderRadius: 20,
        justifyContent: 'center', alignItems: 'center',
    },
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
        width: 50, height: 50, borderRadius: 25, backgroundColor: theme.colors.background,
        justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.md
    },
    info: { flex: 1 },
    name: { fontWeight: '600', fontSize: 16, color: theme.colors.text },
    desc: { color: theme.colors.textSecondary, fontSize: 14, marginVertical: 2 },
    meta: { color: theme.colors.primary, fontSize: 12, fontWeight: '500' },
    empty: { textAlign: 'center', marginTop: 20, color: theme.colors.textSecondary }
});
