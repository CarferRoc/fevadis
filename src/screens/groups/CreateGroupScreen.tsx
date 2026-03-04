import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { theme } from '../../theme';
import { groupsService } from '../../services/groupsService';
import { useAuthStore } from '../../store/useAuthStore';
import { useQueryClient } from '@tanstack/react-query';

export default function CreateGroupScreen() {
    const navigation = useNavigation();
    const { user } = useAuthStore();
    const queryClient = useQueryClient();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!name || !description) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        setLoading(true);
        try {
            await groupsService.createGroup(name, description, user!.id);
            queryClient.invalidateQueries({ queryKey: ['groups'] });
            navigation.goBack();
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Screen centered style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Create New Group</Text>

                <Text style={styles.label}>Group Name</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. Logic Team"
                    value={name}
                    onChangeText={setName}
                />

                <Text style={styles.label}>Description</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Short description..."
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={3}
                />

                <Button
                    title="Create Group"
                    onPress={handleCreate}
                    loading={loading}
                    style={{ marginTop: 20 }}
                />

                <Button
                    title="Cancel"
                    variant="outline"
                    onPress={() => navigation.goBack()}
                    style={{ marginTop: 10 }}
                />
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: { padding: theme.spacing.lg, backgroundColor: 'rgba(0,0,0,0.5)' },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.xl,
        width: '100%',
    },
    title: { ...theme.typography.h2, marginBottom: theme.spacing.lg, textAlign: 'center' },
    label: { ...theme.typography.label, marginTop: theme.spacing.md },
    input: {
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        marginTop: theme.spacing.xs,
        backgroundColor: theme.colors.background,
    },
    textArea: { height: 80, textAlignVertical: 'top' },
});
