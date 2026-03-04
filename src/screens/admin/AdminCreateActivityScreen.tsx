import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    TouchableOpacity,
    Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { activitiesService } from '../../services/activitiesService';
import { FormInput } from '../../components/FormInput';
import { Button } from '../../components/Button';
import { theme } from '../../theme';
import { ActivityCategory } from '../../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const CATEGORIES: ActivityCategory[] = ['Ocio', 'Campamentos', 'Formaciones', 'Talleres'];

type DatePickerMode = 'inicio' | 'fin';

export default function AdminCreateActivityScreen() {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);

    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [categoria, setCategoria] = useState<ActivityCategory>('Ocio');
    const [ubicacion, setUbicacion] = useState('');
    const [plazas, setPlazas] = useState('');
    const [fechaInicio, setFechaInicio] = useState(new Date());
    const [fechaFin, setFechaFin] = useState(() => {
        const d = new Date();
        d.setHours(d.getHours() + 2);
        return d;
    });

    const [pickerVisible, setPickerVisible] = useState<DatePickerMode | null>(null);

    function handleDateChange(mode: DatePickerMode, _: any, date?: Date) {
        if (Platform.OS !== 'ios') setPickerVisible(null);
        if (!date) return;
        if (mode === 'inicio') setFechaInicio(date);
        else setFechaFin(date);
    }

    async function handleCreate() {
        if (!titulo.trim() || !plazas) {
            Alert.alert('Error', 'El título y las plazas son obligatorios.');
            return;
        }
        if (isNaN(parseInt(plazas)) || parseInt(plazas) < 1) {
            Alert.alert('Error', 'Las plazas deben ser un número mayor a 0.');
            return;
        }
        if (fechaFin <= fechaInicio) {
            Alert.alert('Error', 'La fecha de fin debe ser posterior a la de inicio.');
            return;
        }

        setLoading(true);
        try {
            await activitiesService.createActivity({
                titulo: titulo.trim(),
                descripcion: descripcion.trim() || null,
                categoria,
                ubicacion: ubicacion.trim() || null,
                plazas: parseInt(plazas),
                fecha_inicio: fechaInicio.toISOString(),
                fecha_fin: fechaFin.toISOString(),
            });
            Alert.alert('✅ Actividad creada', '', [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        } catch (e: any) {
            Alert.alert('Error', e.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <FormInput label="Título *" placeholder="Nombre de la actividad" value={titulo} onChangeText={setTitulo} />

            <View style={styles.pickerWrapper}>
                <Text style={styles.pickerLabel}>Categoría</Text>
                <View style={styles.pickerBox}>
                    <Picker selectedValue={categoria} onValueChange={(v) => setCategoria(v)}>
                        {CATEGORIES.map((cat) => (
                            <Picker.Item key={cat} label={cat} value={cat} />
                        ))}
                    </Picker>
                </View>
            </View>

            <FormInput
                label="Descripción"
                placeholder="Descripción de la actividad"
                value={descripcion}
                onChangeText={setDescripcion}
                multiline
                numberOfLines={3}
                style={styles.textArea}
            />

            <FormInput label="Ubicación" placeholder="Dirección o nombre del lugar" value={ubicacion} onChangeText={setUbicacion} />
            <FormInput label="Plazas *" placeholder="Ej: 20" value={plazas} onChangeText={setPlazas} keyboardType="numeric" />

            {/* Fecha inicio */}
            <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setPickerVisible('inicio')}
            >
                <Text style={styles.dateLabel}>Fecha inicio</Text>
                <Text style={styles.dateValue}>
                    {format(fechaInicio, "d MMM yyyy, HH:mm", { locale: es })}
                </Text>
            </TouchableOpacity>

            {/* Fecha fin */}
            <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setPickerVisible('fin')}
            >
                <Text style={styles.dateLabel}>Fecha fin</Text>
                <Text style={styles.dateValue}>
                    {format(fechaFin, "d MMM yyyy, HH:mm", { locale: es })}
                </Text>
            </TouchableOpacity>

            {pickerVisible && (
                <DateTimePicker
                    value={pickerVisible === 'inicio' ? fechaInicio : fechaFin}
                    mode="datetime"
                    display={Platform.OS === 'ios' ? 'inline' : 'default'}
                    onChange={(e, d) => handleDateChange(pickerVisible!, e, d)}
                />
            )}

            <Button
                title="Crear actividad"
                onPress={handleCreate}
                loading={loading}
                size="lg"
                style={styles.submitBtn}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: theme.spacing.lg,
        paddingBottom: theme.spacing.xxl,
        gap: theme.spacing.md,
        backgroundColor: theme.colors.background,
    },
    pickerWrapper: {},
    pickerLabel: {
        ...theme.typography.label,
        color: theme.colors.text,
        marginBottom: 6,
    },
    pickerBox: {
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.colors.surface,
        overflow: 'hidden',
    },
    textArea: { height: 80, textAlignVertical: 'top' },
    dateButton: {
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
    },
    dateLabel: { ...theme.typography.caption, color: theme.colors.textSecondary, marginBottom: 4 },
    dateValue: { ...theme.typography.body, color: theme.colors.text, fontWeight: '600' },
    submitBtn: { marginTop: theme.spacing.sm },
});
