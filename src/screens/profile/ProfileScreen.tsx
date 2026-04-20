import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    Pressable,
} from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../utils/supabase';
import { theme } from '../../theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../types/navigation';
import {
    User, ChevronRight, FolderOpen, Activity,
    LogOut, Shield, Gift, Settings as SettingsIcon,
} from 'lucide-react-native';
import { FormInput } from '../../components/FormInput';
import { Button } from '../../components/Button';
import { RoleBadge } from '../../components/RoleBadge';
import { registrationsService } from '../../services/registrationsService';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'ProfileMain'>;

export default function ProfileScreen() {
    const { profile, user, signOut, fetchProfile, isAdminOrEditor } = useAuthStore();
    const navigation = useNavigation<Nav>();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [nombre, setNombre] = useState('');
    const [apellidos, setApellidos] = useState('');
    const [telefono, setTelefono] = useState('');
    const [puntos, setPuntos] = useState(0);

    useEffect(() => {
        if (profile) {
            setNombre(profile.nombre ?? '');
            setApellidos(profile.apellidos ?? '');
            setTelefono(profile.telefono ?? '');
        }
    }, [profile]);

    useFocusEffect(
        useCallback(() => {
            if (!user?.id) return;
            registrationsService.getMyRegistrations(user.id)
                .then(regs => {
                    const asistidos = regs.filter(r => r.status === 'aceptado' && r.attendance === 'asistio');
                    setPuntos(asistidos.length * 10);
                })
                .catch(console.error);
        }, [user?.id])
    );

    async function handleUpdate() {
        if (!user?.id) return;
        setLoading(true);
        const { error } = await supabase
            .from('profiles')
            .update({ nombre, apellidos, telefono })
            .eq('user_id', user.id);
        if (error) Alert.alert('Error', error.message);
        else {
            Alert.alert('Guardado', 'Tu perfil se ha actualizado.');
            setIsEditing(false);
            fetchProfile();
        }
        setLoading(false);
    }

    const initials = [profile?.nombre?.[0], profile?.apellidos?.[0]]
        .filter(Boolean).join('').toUpperCase() || '?';

    const menuItems = [
        {
            key: 'personal',
            icon: User,
            tint: theme.colors.primaryDark,
            tintBg: theme.colors.primaryLight,
            label: 'Información Personal',
            onPress: () => setIsEditing(true),
        },
        {
            key: 'docs',
            icon: FolderOpen,
            tint: theme.colors.catCampamentos,
            tintBg: theme.colors.catCampamentosSoft,
            label: 'Mis Documentos',
            onPress: () => (navigation as any).navigate('UserDocuments'),
        },
        {
            key: 'rewards',
            icon: Gift,
            tint: theme.colors.warning,
            tintBg: theme.colors.warningSoft,
            label: 'Recompensas',
            onPress: () => (navigation as any).navigate('Rewards', { puntos }),
        },
        {
            key: 'activity',
            icon: Activity,
            tint: theme.colors.catFormaciones,
            tintBg: theme.colors.catFormacionesSoft,
            label: 'Mi Actividad',
            onPress: () => (navigation as any).navigate('MyRegistrations'),
        },
    ] as const;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.topBar}>
                    <Text style={styles.topTitle}>Mi perfil</Text>
                </View>

                <View style={styles.hero}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{initials}</Text>
                    </View>
                    <Text style={styles.name}>
                        {profile?.nombre ?? ''} {profile?.apellidos ?? ''}
                    </Text>
                    <Text style={styles.email}>{profile?.email ?? user?.email}</Text>
                    <View style={styles.badgeRow}>
                        {profile?.role && <RoleBadge role={profile.role} />}
                        <View style={styles.pointsBadge}>
                            <Gift size={12} color={theme.colors.warning} />
                            <Text style={styles.pointsBadgeText}>{puntos} pts</Text>
                        </View>
                    </View>
                </View>

                {isEditing ? (
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Editar información</Text>
                        <View style={{ gap: 10 }}>
                            <FormInput label="Nombre" value={nombre} onChangeText={setNombre} />
                            <FormInput label="Apellidos" value={apellidos} onChangeText={setApellidos} />
                            <FormInput
                                label="Teléfono"
                                value={telefono}
                                onChangeText={setTelefono}
                                keyboardType="phone-pad"
                            />
                        </View>
                        <View style={styles.editActions}>
                            <Button
                                title="Cancelar"
                                variant="outline"
                                onPress={() => setIsEditing(false)}
                                style={{ flex: 1 }}
                            />
                            <Button
                                title="Guardar"
                                onPress={handleUpdate}
                                loading={loading}
                                style={{ flex: 1 }}
                            />
                        </View>
                    </View>
                ) : (
                    <>
                        <Text style={styles.sectionLabel}>AJUSTES</Text>
                        <View style={styles.card}>
                            {menuItems.map((item, idx) => (
                                <React.Fragment key={item.key}>
                                    <Pressable
                                        onPress={item.onPress}
                                        style={({ pressed }) => [
                                            styles.menuItem,
                                            pressed && { backgroundColor: theme.colors.primarySoft },
                                        ]}
                                    >
                                        <View style={[styles.menuIcon, { backgroundColor: item.tintBg }]}>
                                            <item.icon size={16} color={item.tint} strokeWidth={2.2} />
                                        </View>
                                        <Text style={styles.menuLabel}>{item.label}</Text>
                                        <ChevronRight size={16} color={theme.colors.textTertiary} />
                                    </Pressable>
                                    {idx < menuItems.length - 1 && <View style={styles.divider} />}
                                </React.Fragment>
                            ))}
                        </View>

                        {isAdminOrEditor && (
                            <>
                                <Text style={styles.sectionLabel}>ADMINISTRACIÓN</Text>
                                <View style={styles.card}>
                                    <Pressable
                                        style={({ pressed }) => [
                                            styles.menuItem,
                                            pressed && { backgroundColor: theme.colors.primarySoft },
                                        ]}
                                        onPress={() =>
                                            navigation.navigate('AdminNavigator', { screen: 'AdminHome' } as any)
                                        }
                                    >
                                        <View style={[styles.menuIcon, { backgroundColor: theme.colors.roleAdminSoft }]}>
                                            <Shield size={16} color={theme.colors.roleAdmin} strokeWidth={2.2} />
                                        </View>
                                        <Text style={[styles.menuLabel, { color: theme.colors.roleAdmin, fontWeight: '700' }]}>
                                            Panel de administración
                                        </Text>
                                        <ChevronRight size={16} color={theme.colors.roleAdmin} />
                                    </Pressable>
                                </View>
                            </>
                        )}

                        <View style={styles.card}>
                            <Pressable
                                style={({ pressed }) => [
                                    styles.menuItem,
                                    pressed && { backgroundColor: theme.colors.errorSoft },
                                ]}
                                onPress={() =>
                                    Alert.alert('Cerrar sesión', '¿Estás seguro?', [
                                        { text: 'Cancelar', style: 'cancel' },
                                        { text: 'Salir', style: 'destructive', onPress: signOut },
                                    ])
                                }
                            >
                                <View style={[styles.menuIcon, { backgroundColor: theme.colors.errorSoft }]}>
                                    <LogOut size={16} color={theme.colors.error} strokeWidth={2.2} />
                                </View>
                                <Text style={[styles.menuLabel, { color: theme.colors.error, fontWeight: '700' }]}>
                                    Cerrar sesión
                                </Text>
                            </Pressable>
                        </View>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    scroll: { paddingBottom: 32 },

    topBar: {
        paddingHorizontal: 18,
        paddingTop: 10,
        paddingBottom: 4,
    },
    topTitle: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
        fontWeight: '700',
        letterSpacing: 0.6,
        textTransform: 'uppercase',
    },

    hero: {
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingTop: 18,
        paddingBottom: 24,
    },
    avatar: {
        width: 84,
        height: 84,
        borderRadius: 42,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        ...theme.shadow.sm,
    },
    avatarText: {
        fontSize: 30,
        fontWeight: '800',
        color: '#fff',
    },
    name: {
        ...theme.typography.h2,
        color: theme.colors.text,
        textAlign: 'center',
    },
    email: {
        ...theme.typography.bodySmall,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    badgeRow: {
        flexDirection: 'row',
        gap: 6,
        alignItems: 'center',
        marginTop: 10,
    },
    pointsBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.warningSoft,
        paddingHorizontal: 9,
        paddingVertical: 3,
        borderRadius: theme.radius.pill,
        gap: 4,
    },
    pointsBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: theme.colors.warning,
    },

    sectionLabel: {
        ...theme.typography.overline,
        color: theme.colors.textTertiary,
        marginHorizontal: 18,
        marginTop: 10,
        marginBottom: 6,
    },
    card: {
        backgroundColor: theme.colors.surface,
        marginHorizontal: 14,
        marginBottom: 8,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        paddingVertical: 4,
        paddingHorizontal: 4,
    },
    sectionTitle: {
        ...theme.typography.h4,
        color: theme.colors.text,
        marginBottom: 12,
        paddingHorizontal: 12,
        paddingTop: 10,
    },
    editActions: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 14,
        paddingHorizontal: 12,
        paddingBottom: 10,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 11,
        paddingHorizontal: 12,
        borderRadius: theme.radius.md,
    },
    menuIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuLabel: {
        ...theme.typography.body,
        color: theme.colors.text,
        flex: 1,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginHorizontal: 12,
    },
});
