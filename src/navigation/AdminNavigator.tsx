import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../types/navigation';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigation } from '@react-navigation/native';

// Admin screens
import AdminHomeScreen from '../screens/admin/AdminHomeScreen';
import AdminActivitiesScreen from '../screens/admin/AdminActivitiesScreen';
import AdminCreateActivityScreen from '../screens/admin/AdminCreateActivityScreen';
import AdminEditActivityScreen from '../screens/admin/AdminEditActivityScreen';
import AdminRegistrationsScreen from '../screens/admin/AdminRegistrationsScreen';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';
import AdminAuthorizedDnisScreen from '../screens/admin/AdminAuthorizedDnisScreen';
import AdminUserDocumentsScreen from '../screens/admin/AdminUserDocumentsScreen';
import AdminCertificatesScreen from '../screens/admin/AdminCertificatesScreen';
import AdminActivityAttendeesScreen from '../screens/admin/AdminActivityAttendeesScreen';
import AdminRewardsScreen from '../screens/admin/AdminRewardsScreen';
import AdminRewardFormScreen from '../screens/admin/AdminRewardFormScreen';
import AdminGroupChatsScreen from '../screens/admin/AdminGroupChatsScreen';
import AdminCreateGroupChatScreen from '../screens/admin/AdminCreateGroupChatScreen';
import AdminInfoScreen from '../screens/admin/AdminInfoScreen';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../theme';

const Stack = createNativeStackNavigator<AdminStackParamList>();

function BackButton() {
    const navigation = useNavigation();
    return (
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingRight: 8 }}>
            <Text style={{ color: '#fff', fontSize: 24 }}>←</Text>
        </TouchableOpacity>
    );
}

export default function AdminNavigator() {
    const { isAdminOrEditor } = useAuthStore();

    if (!isAdminOrEditor) {
        return (
            <View style={styles.blocked}>
                <Text style={styles.blockedText}>Acceso denegado</Text>
            </View>
        );
    }

    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: theme.colors.primary },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: '700' },
            }}
        >
            <Stack.Screen
                name="AdminHome"
                component={AdminHomeScreen}
                options={{
                    title: 'Panel de Administración',
                    headerLeft: () => <BackButton />,
                }}
            />
            <Stack.Screen name="AdminActivities" component={AdminActivitiesScreen} options={{ title: 'Actividades' }} />
            <Stack.Screen name="AdminCreateActivity" component={AdminCreateActivityScreen} options={{ title: 'Nueva Actividad' }} />
            <Stack.Screen name="AdminEditActivity" component={AdminEditActivityScreen} options={{ title: 'Editar Actividad' }} />
            <Stack.Screen name="AdminRegistrations" component={AdminRegistrationsScreen} options={{ title: 'Inscripciones' }} />
            <Stack.Screen name="AdminUsers" component={AdminUsersScreen} options={{ title: 'Usuarios' }} />
            <Stack.Screen name="AdminAuthorizedDnis" component={AdminAuthorizedDnisScreen} options={{ title: 'DNIs Autorizados' }} />
            <Stack.Screen
                name="AdminUserDocuments"
                component={AdminUserDocumentsScreen}
                options={({ route }) => ({ title: `Archivos de ${(route.params as any).userName}` })}
            />
            <Stack.Screen name="AdminCertificates" component={AdminCertificatesScreen} options={{ title: 'Certificados' }} />
            <Stack.Screen
                name="AdminActivityAttendees"
                component={AdminActivityAttendeesScreen}
                options={({ route }) => ({ title: (route.params as any).activityTitle ?? 'Asistentes' })}
            />
            <Stack.Screen name="AdminRewards" component={AdminRewardsScreen} options={{ title: 'Recompensas' }} />
            <Stack.Screen name="AdminRewardForm" component={AdminRewardFormScreen} options={{ title: 'Gestión de Recompensa' }} />
            <Stack.Screen name="AdminGroupChats" component={AdminGroupChatsScreen} options={{ title: 'Chats Grupales' }} />
            <Stack.Screen name="AdminCreateGroupChat" component={AdminCreateGroupChatScreen} options={{ title: 'Nuevo Grupo' }} />
            <Stack.Screen name="AdminInfo" component={AdminInfoScreen} options={{ title: 'Información' }} />
        </Stack.Navigator>
    );
}

const styles = StyleSheet.create({
    blocked: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
    },
    blockedText: {
        ...theme.typography.h3,
        color: theme.colors.error,
    },
});
