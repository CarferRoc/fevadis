import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../types/navigation';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { rewardsService } from '../../services/rewardsService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FormInput } from '../../components/FormInput';
import { Button } from '../../components/Button';
import { theme } from '../../theme';
import { useAuthStore } from '../../store/useAuthStore';

type AdminRewardFormRouteProp = RouteProp<AdminStackParamList, 'AdminRewardForm'>;
type Nav = NativeStackNavigationProp<AdminStackParamList, 'AdminRewardForm'>;

export default function AdminRewardFormScreen() {
    const route = useRoute<AdminRewardFormRouteProp>();
    const navigation = useNavigation<Nav>();
    const queryClient = useQueryClient();
    const { user } = useAuthStore();
    const rewardId = route.params?.rewardId;
    const isEditing = !!rewardId;

    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [costoPuntos, setCostoPuntos] = useState('0');
    const [stock, setStock] = useState('');

    const { data: existingReward } = useQuery({
        queryKey: ['reward', rewardId],
        queryFn: async () => {
            const all = await rewardsService.getAllRewards();
            return all.find(r => r.id === rewardId);
        },
        enabled: isEditing,
    });

    useEffect(() => {
        if (existingReward) {
            setTitulo(existingReward.titulo);
            setDescripcion(existingReward.descripcion || '');
            setCostoPuntos(existingReward.costo_puntos.toString());
            setStock(existingReward.stock !== null && existingReward.stock !== undefined ? existingReward.stock.toString() : '');
        }
    }, [existingReward]);

    const mutation = useMutation({
        mutationFn: async () => {
            const data = {
                titulo,
                descripcion,
                costo_puntos: parseInt(costoPuntos, 10) || 0,
                stock: stock.trim() !== '' ? parseInt(stock, 10) : null,
                created_by: user?.id,
            };

            if (isEditing && rewardId) {
                return rewardsService.updateReward(rewardId, data);
            }
            return rewardsService.createReward(data as any);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-rewards'] });
            Alert.alert('Éxito', `Recompensa ${isEditing ? 'actualizada' : 'creada'} correctamente`);
            navigation.goBack();
        },
        onError: (error: any) => {
            Alert.alert('Error', error.message || 'Error al guardar la recompensa');
        },
    });

    const handleSave = () => {
        if (!titulo.trim()) {
            Alert.alert('Error', 'El título es obligatorio');
            return;
        }
        mutation.mutate();
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
            >
                <ScrollView contentContainerStyle={styles.scroll}>
                    <Text style={styles.sectionTitle}>
                        {isEditing ? 'Editar Recompensa' : 'Nueva Recompensa'}
                    </Text>

                    <FormInput
                        label="Título *"
                        value={titulo}
                        onChangeText={setTitulo}
                        placeholder="Ej: Camiseta Oficial FEVADIS"
                    />

                    <FormInput
                        label="Descripción"
                        value={descripcion}
                        onChangeText={setDescripcion}
                        maxLength={500}
                        multiline
                    />

                    <FormInput
                        label="Costo en Puntos *"
                        value={costoPuntos}
                        onChangeText={setCostoPuntos}
                        keyboardType="number-pad"
                        placeholder="0"
                    />

                    <FormInput
                        label="Stock (vacío para ilimitado)"
                        value={stock}
                        onChangeText={setStock}
                        keyboardType="number-pad"
                        placeholder="Ej: 50"
                    />

                    <Button
                        title={isEditing ? 'Guardar Cambios' : 'Crear Recompensa'}
                        onPress={handleSave}
                        loading={mutation.isPending}
                        style={styles.saveBtn}
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    scroll: { padding: theme.spacing.lg },
    sectionTitle: { ...theme.typography.h3, color: theme.colors.text, marginBottom: theme.spacing.lg },
    saveBtn: { marginTop: theme.spacing.lg },
});
