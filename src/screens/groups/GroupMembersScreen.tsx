import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupsService, GroupMember } from '../../services/groupsService';
import { usersService, Profile } from '../../services/usersService';
import { Screen } from '../../components/Screen';
import { theme } from '../../theme';
import { UserPlus, Trash, X } from 'lucide-react-native';
import { useAuthStore } from '../../store/useAuthStore';

export default function GroupMembersScreen() {
    const route = useRoute<any>();
    const navigation = useNavigation();
    const { groupId } = route.params;
    const { profile } = useAuthStore();
    const queryClient = useQueryClient();

    const [modalVisible, setModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const { data: groupData, isLoading: loadingGroup } = useQuery({
        queryKey: ['group', groupId],
        queryFn: () => groupsService.getGroupDetails(groupId),
    });

    const { data: searchResults } = useQuery({
        queryKey: ['users', searchQuery],
        queryFn: () => usersService.searchUsers(searchQuery),
        enabled: modalVisible && searchQuery.length > 1,
    });

    const addMemberMutation = useMutation({
        mutationFn: (userId: string) => groupsService.addGroupMember(groupId, userId),
        onSuccess: () => {
            Alert.alert('Success', 'Member added');
            setModalVisible(false);
            setSearchQuery('');
            queryClient.invalidateQueries({ queryKey: ['group', groupId] });
        },
        onError: (error: any) => Alert.alert('Error', error.message),
    });

    const renderMember = ({ item }: { item: GroupMember & { profiles: any } }) => (
        <View style={styles.memberRow}>
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                    {item.profiles?.first_name?.[0]}{item.profiles?.last_name?.[0]}
                </Text>
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.name}>
                    {item.profiles?.first_name} {item.profiles?.last_name}
                </Text>
                <Text style={styles.role}>{item.role}</Text>
            </View>
        </View>
    );

    const renderSearchItem = ({ item }: { item: Profile }) => (
        <TouchableOpacity
            style={styles.searchItem}
            onPress={() => addMemberMutation.mutate(item.user_id)}
        >
            <Text style={styles.name}>{item.first_name} {item.last_name}</Text>
            <UserPlus size={20} color={theme.colors.primary} />
        </TouchableOpacity>
    );

    const members = groupData?.group_members || [];

    // Check if current user is admin of the group or app admin
    const isAdmin = profile?.role === 'admin' || members.some((m: any) => m.user_id === profile?.user_id && m.role === 'admin');

    return (
        <Screen safeArea={false} style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={{ fontSize: 24, marginRight: 10 }}>←</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Members ({members.length})</Text>
                {isAdmin && (
                    <TouchableOpacity onPress={() => setModalVisible(true)}>
                        <UserPlus color={theme.colors.primary} size={24} />
                    </TouchableOpacity>
                )}
            </View>

            <FlatList
                data={members}
                keyExtractor={(item) => item.user_id}
                renderItem={renderMember}
                contentContainerStyle={styles.list}
            />

            <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Add Member</Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <X color={theme.colors.text} size={24} />
                        </TouchableOpacity>
                    </View>

                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search users..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />

                    <FlatList
                        data={searchResults}
                        keyExtractor={(item) => item.id}
                        renderItem={renderSearchItem}
                        style={styles.searchResults}
                    />
                </View>
            </Modal>
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: { backgroundColor: theme.colors.background, flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 50, paddingBottom: 15, paddingHorizontal: 15,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1, borderBottomColor: theme.colors.border
    },
    title: { fontSize: 18, fontWeight: '600' },
    list: { padding: 15 },
    memberRow: {
        flexDirection: 'row', alignItems: 'center', marginBottom: 15,
        backgroundColor: theme.colors.surface, padding: 10, borderRadius: 8
    },
    avatar: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.primary,
        justifyContent: 'center', alignItems: 'center', marginRight: 10
    },
    avatarText: { color: '#fff', fontWeight: 'bold' },
    name: { fontWeight: '600', fontSize: 16 },
    role: { fontSize: 12, color: theme.colors.textSecondary, textTransform: 'capitalize' },

    modalContainer: { flex: 1, backgroundColor: theme.colors.background, padding: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: 'bold' },
    searchInput: {
        backgroundColor: theme.colors.surface, padding: 12, borderRadius: 8,
        borderWidth: 1, borderColor: theme.colors.border, marginBottom: 10
    },
    searchResults: { marginTop: 10 },
    searchItem: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: 15, backgroundColor: theme.colors.surface, marginBottom: 5, borderRadius: 8
    }
});
