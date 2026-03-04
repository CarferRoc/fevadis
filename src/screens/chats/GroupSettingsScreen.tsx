import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, ActivityIndicator, Alert } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { ChatsStackParamList } from '../../types/navigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../theme';
import { chatService } from '../../services/chatService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Lock } from 'lucide-react-native';

type Route = RouteProp<ChatsStackParamList, 'GroupSettings'>;

export default function GroupSettingsScreen() {
    const route = useRoute<Route>();
    const navigation = useNavigation();
    const queryClient = useQueryClient();
    const { chatId, initialSettings } = route.params;

    const [onlyAdmins, setOnlyAdmins] = useState(initialSettings);

    const mutation = useMutation({
        mutationFn: async (newValue: boolean) => {
            await chatService.updateGroupSettings(chatId, newValue);
            return newValue;
        },
        onSuccess: (newValue) => {
            queryClient.invalidateQueries({ queryKey: ['admin-groups'] });
            queryClient.invalidateQueries({ queryKey: ['chats'] });
            setOnlyAdmins(newValue);
        },
        onError: (err: any) => {
            Alert.alert('Error', err.message || 'No se pudo guardar la configuración');
            setOnlyAdmins(!onlyAdmins); // revert
        }
    });

    const toggleSwitch = (val: boolean) => {
        setOnlyAdmins(val);
        mutation.mutate(val);
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <View style={styles.card}>
                <View style={styles.header}>
                    <View style={styles.iconBox}>
                        <Lock size={24} color={theme.colors.primary} />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.title}>Silenciar Voluntarios</Text>
                        <Text style={styles.subtitle}>
                            Si activas esto, solo los Administradores y Editores podrán enviar mensajes en este grupo.
                        </Text>
                    </View>
                </View>

                <View style={styles.actionRow}>
                    <Text style={styles.label}>Solo admins hablan</Text>
                    {mutation.isPending ? (
                        <ActivityIndicator color={theme.colors.primary} />
                    ) : (
                        <Switch
                            trackColor={{ false: '#d1d5db', true: theme.colors.primary + '80' }}
                            thumbColor={onlyAdmins ? theme.colors.primary : '#f4f3f4'}
                            onValueChange={toggleSwitch}
                            value={onlyAdmins}
                        />
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFAFA', padding: theme.spacing.lg },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        padding: theme.spacing.xl,
        ...theme.shadow.sm,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 24, gap: 16 },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: theme.colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: { flex: 1 },
    title: { ...theme.typography.h3, color: theme.colors.text, marginBottom: 4 },
    subtitle: { ...theme.typography.bodySmall, color: theme.colors.textSecondary, lineHeight: 20 },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    label: { ...theme.typography.body, fontWeight: '600', color: theme.colors.text },
});
