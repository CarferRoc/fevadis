import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Alert, Platform, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { activitiesService } from '../../services/activitiesService';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { theme } from '../../theme';
import { ActivityCategory } from '../../types/activity';
import { format } from 'date-fns';
import { useAuthStore } from '../../store/useAuthStore';

export default function CreateActivityScreen() {
    const navigation = useNavigation();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<ActivityCategory>('Ocio');
    const [location, setLocation] = useState('');
    const [maxSpots, setMaxSpots] = useState('');
    const [date, setDate] = useState(new Date());

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    async function handleCreate() {
        if (!title || !category || !date || !maxSpots) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            await activitiesService.createActivity({
                title,
                description,
                category,
                location,
                max_spots: parseInt(maxSpots, 10),
                date: date.toISOString(),
            });
            alert('Success');
            navigation.goBack();
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    }

    const onChangeDate = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            const currentDate = date;
            selectedDate.setHours(currentDate.getHours());
            selectedDate.setMinutes(currentDate.getMinutes());
            setDate(selectedDate);
            if (Platform.OS === 'android') setShowTimePicker(true);
        }
    };

    const onChangeTime = (event: any, selectedDate?: Date) => {
        setShowTimePicker(Platform.OS === 'ios');
        if (selectedDate) {
            const currentDate = date;
            selectedDate.setFullYear(currentDate.getFullYear());
            selectedDate.setMonth(currentDate.getMonth());
            selectedDate.setDate(currentDate.getDate());
            setDate(selectedDate);
        }
    };

    return (
        <Screen centered>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>New Activity</Text>

                <View style={styles.form}>
                    <TextInput
                        style={styles.input}
                        placeholder="Title *"
                        value={title}
                        onChangeText={setTitle}
                    />

                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={category}
                            onValueChange={(itemValue) => setCategory(itemValue)}
                        >
                            <Picker.Item label="Ocio" value="Ocio" />
                            <Picker.Item label="Campamentos" value="Campamentos" />
                            <Picker.Item label="Formaciones" value="Formaciones" />
                            <Picker.Item label="Talleres" value="Talleres" />
                        </Picker>
                    </View>

                    <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
                        <Text>{format(date, 'PPP p')}</Text>
                    </TouchableOpacity>

                    {(showDatePicker || showTimePicker) && (
                        <DateTimePicker
                            value={date}
                            mode={showDatePicker ? 'date' : 'time'}
                            display="default"
                            onChange={showDatePicker ? onChangeDate : onChangeTime}
                        />
                    )}

                    <TextInput
                        style={styles.input}
                        placeholder="Location"
                        value={location}
                        onChangeText={setLocation}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Max Spots *"
                        value={maxSpots}
                        onChangeText={setMaxSpots}
                        keyboardType="numeric"
                    />

                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Description"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={4}
                    />

                    <Button title="Create" onPress={handleCreate} loading={loading} />
                </View>
            </ScrollView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: { padding: theme.spacing.lg },
    title: { ...theme.typography.h1, marginBottom: 20, textAlign: 'center' },
    form: { gap: 10 },
    input: {
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.border
    },
    textArea: { height: 100, textAlignVertical: 'top' },
    pickerContainer: {
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.colors.surface,
    }
});
