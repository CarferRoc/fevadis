import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, Text } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../utils/supabase';
import { theme } from '../theme';

// Auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Tab screens
import ActivitiesScreen from '../screens/activities/ActivitiesScreen';
import ActivityDetailScreen from '../screens/activities/ActivityDetailScreen';
import MyRegistrationsScreen from '../screens/activities/MyRegistrationsScreen';
import InfoScreen from '../screens/info/InfoScreen';
import ChatsListScreen from '../screens/chats/ChatsListScreen';
import ChatScreen from '../screens/chats/ChatScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import UserDocumentsScreen from '../screens/profile/UserDocumentsScreen';
import RewardsScreen from '../screens/profile/RewardsScreen';
import AdminNavigator from './AdminNavigator';

import {
    AuthStackParamList,
    ActivitiesStackParamList,
    ChatsStackParamList,
    ProfileStackParamList,
    AppTabParamList,
    AdminStackParamList,
} from '../types/navigation';

// Icons
import { Layers, Info, MessageCircle, User } from 'lucide-react-native';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const ActivitiesStack = createNativeStackNavigator<ActivitiesStackParamList>();
const ChatsStack = createNativeStackNavigator<ChatsStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
const Tab = createBottomTabNavigator<AppTabParamList>();

function ActivitiesNavigator() {
    return (
        <ActivitiesStack.Navigator screenOptions={{ headerShown: false }}>
            <ActivitiesStack.Screen name="ActivitiesList" component={ActivitiesScreen} />
            <ActivitiesStack.Screen
                name="ActivityDetail"
                component={ActivityDetailScreen}
                options={{ headerShown: true, title: 'Detalle' }}
            />
            <ActivitiesStack.Screen
                name="MyRegistrations"
                component={MyRegistrationsScreen}
                options={{ headerShown: true, title: 'Mis Inscripciones' }}
            />
        </ActivitiesStack.Navigator>
    );
}

function ChatsNavigator() {
    return (
        <ChatsStack.Navigator screenOptions={{ headerShown: false }}>
            <ChatsStack.Screen name="ChatsList" component={ChatsListScreen} />
            <ChatsStack.Screen
                name="Chat"
                component={ChatScreen}
                options={({ route }) => ({
                    headerShown: true,
                    title: (route.params as any)?.otherUserName ?? 'Chat',
                })}
            />
            <ChatsStack.Screen
                name="GroupSettings"
                component={require('../screens/chats/GroupSettingsScreen').default}
                options={{ headerShown: true, title: 'Ajustes del Grupo' }}
            />
        </ChatsStack.Navigator>
    );
}

function ProfileNavigator() {
    return (
        <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
            <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
            <ProfileStack.Screen
                name="AdminNavigator"
                component={AdminNavigator}
                options={{ headerShown: false }}
            />
            <ProfileStack.Screen
                name="UserDocuments"
                component={UserDocumentsScreen}
                options={{ headerShown: true, title: 'Mis Documentos', headerStyle: { backgroundColor: theme.colors.primary }, headerTintColor: '#fff', headerTitleStyle: { fontWeight: '700' } }}
            />
            <ProfileStack.Screen
                name="MyRegistrations"
                component={MyRegistrationsScreen}
                options={{ headerShown: true, title: 'Mi Actividad', headerStyle: { backgroundColor: theme.colors.primary }, headerTintColor: '#fff', headerTitleStyle: { fontWeight: '700' } }}
            />
            <ProfileStack.Screen
                name="Rewards"
                component={RewardsScreen}
                options={{ headerShown: true, title: 'Recompensas', headerStyle: { backgroundColor: theme.colors.primary }, headerTintColor: '#fff', headerTitleStyle: { fontWeight: '700' } }}
            />
        </ProfileStack.Navigator>
    );
}

function AppTabs() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.textSecondary,
                tabBarStyle: {
                    borderTopColor: theme.colors.border,
                    backgroundColor: theme.colors.surface,
                },
                tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
            }}
        >
            <Tab.Screen
                name="Actividades"
                component={ActivitiesNavigator}
                options={{
                    tabBarIcon: ({ color, size }) => <Layers color={color} size={size} />,
                }}
            />
            <Tab.Screen
                name="Información"
                component={InfoScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <Info color={color} size={size} />,
                }}
            />
            <Tab.Screen
                name="Chats"
                component={ChatsNavigator}
                options={{
                    tabBarIcon: ({ color, size }) => <MessageCircle color={color} size={size} />,
                }}
            />
            <Tab.Screen
                name="Perfil"
                component={ProfileNavigator}
                options={{
                    tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
                }}
            />
        </Tab.Navigator>
    );
}

function AuthNavigator() {
    return (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
            <AuthStack.Screen name="Login" component={LoginScreen} />
            <AuthStack.Screen name="Register" component={RegisterScreen} />
        </AuthStack.Navigator>
    );
}

export default function RootNavigator() {
    const { session, setSession, isLoading } = useAuthStore();

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            {session ? <AppTabs /> : <AuthNavigator />}
        </NavigationContainer>
    );
}
