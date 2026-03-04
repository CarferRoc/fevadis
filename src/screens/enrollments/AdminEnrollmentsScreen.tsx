import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../utils/supabase';
import { Screen } from '../../components/Screen';
import { theme } from '../../theme';
import { Button } from '../../components/Button';
import { format } from 'date-fns';

export default function AdminEnrollmentsScreen() {
    const { data: enrollments, refetch, isLoading } = useQuery({
        queryKey: ['admin-enrollments'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('enrollments')
                .select(`
          *,
          activity:activities(title, date),
          profile:profiles(first_name, last_name, email)
        `)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        },
    });

    async function updateStatus(id: string, status: 'accepted' | 'rejected') {
        const { error } = await supabase
            .from('enrollments')
            .update({ status })
            .eq('id', id);

        if (error) Alert.alert('Error', error.message);
        else refetch();
    }

    async function updateAttendance(id: string, attended: boolean) {
        const { error } = await supabase
            .from('enrollments')
            .update({ attended })
            .eq('id', id);

        if (error) Alert.alert('Error', error.message);
        else refetch();
    }

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.activityTitle}>{item.activity?.title}</Text>
                <Text style={styles.date}>{format(new Date(item.activity?.date), 'P')}</Text>
            </View>

            <Text style={styles.user}>{item.profile?.first_name} {item.profile?.last_name}</Text>
            <Text style={styles.email}>{item.profile?.email}</Text>

            <View style={styles.statusRow}>
                <Text>Status: <Text style={{ fontWeight: 'bold' }}>{item.status}</Text></Text>
                {item.status === 'pending' && (
                    <View style={styles.actions}>
                        <Button title="Accept" onPress={() => updateStatus(item.id, 'accepted')} style={styles.smallBtn} />
                        <Button title="Reject" variant="danger" onPress={() => updateStatus(item.id, 'rejected')} style={styles.smallBtn} />
                    </View>
                )}
            </View>

            {item.status === 'accepted' && (
                <View style={styles.attendanceRow}>
                    <Text>Attendance: </Text>
                    <View style={styles.actions}>
                        <Button
                            title="Yes"
                            variant={item.attended === true ? 'primary' : 'outline'}
                            onPress={() => updateAttendance(item.id, true)}
                            style={styles.microBtn}
                        />
                        <Button
                            title="No"
                            variant={item.attended === false ? 'danger' : 'outline'}
                            onPress={() => updateAttendance(item.id, false)}
                            style={styles.microBtn}
                        />
                    </View>
                </View>
            )}
        </View>
    );

    return (
        <Screen safeArea={false} style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Manage Enrollments</Text>
            </View>
            <FlatList
                data={enrollments}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
            />
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: { backgroundColor: theme.colors.background },
    header: {
        paddingTop: 60,
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.surface,
    },
    title: { ...theme.typography.h1 },
    list: { padding: theme.spacing.lg },
    card: {
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        marginBottom: theme.spacing.md,
        borderWidth: 1, borderColor: theme.colors.border
    },
    cardHeader: {
        flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5
    },
    activityTitle: { fontWeight: '600', color: theme.colors.primary },
    date: { color: theme.colors.textSecondary, fontSize: 12 },
    user: { fontWeight: '600', fontSize: 16 },
    email: { color: theme.colors.textSecondary, marginBottom: 10 },
    statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
    actions: { flexDirection: 'row', gap: 5 },
    smallBtn: { paddingVertical: 4, paddingHorizontal: 10, minHeight: 30 },
    attendanceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 5 },
    microBtn: { paddingVertical: 2, paddingHorizontal: 8, minHeight: 25 }
});
