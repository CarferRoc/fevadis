import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    TouchableOpacity,
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
    LogOut, Shield, FileText, Gift
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
            Alert.alert('✅ Guardado', 'Tu perfil ha sido actualizado.');
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
            icon: <User size={18} color={theme.colors.primary} />,
            label: 'Información Personal',
            onPress: () => setIsEditing(true),
        },
        {
            key: 'docs',
            icon: <FolderOpen size={18} color={theme.colors.catCampamentos} />,
            label: 'Mis Documentos',
            onPress: () => (navigation as any).navigate('UserDocuments'),
        },
        {
            key: 'rewards',
            icon: <Gift size={18} color={theme.colors.accent} />,
            label: 'Recompensas',
            onPress: () => (navigation as any).navigate('Rewards', { puntos }),
        },
        {
            key: 'activity',
            icon: <Activity size={18} color={theme.colors.catFormaciones} />,
            label: 'Mi Actividad',
            onPress: () => (navigation as any).navigate('MyRegistrations'),
        },
    ];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                {/* ── Avatar + nombre ── */}
                <View style={styles.heroSection}>
                    <View style={styles.avatarWrapper}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{initials}</Text>
                        </View>
                    </View>
                    <Text style={styles.name}>
                        {profile?.nombre ?? ''} {profile?.apellidos ?? ''}
                    </Text>
                    <Text style={styles.email}>{profile?.email ?? user?.email}</Text>
                    <View style={styles.badgeRow}>
                        {profile?.role && <RoleBadge role={profile.role} />}
                        <View style={styles.pointsBadge}>
                            <Gift size={14} color={theme.colors.accent} />
                            <Text style={styles.pointsBadgeText}>{puntos} pts</Text>
                        </View>
                    </View>
                </View>

                {/* ── Editar perfil (inline) ── */}
                {isEditing && (
                    <View style={styles.editCard}>
                        <Text style={styles.sectionTitle}>Editar Información</Text>
                        <FormInput label="Nombre" value={nombre} onChangeText={setNombre} />
                        <FormInput label="Apellidos" value={apellidos} onChangeText={setApellidos} />
                        <FormInput
                            label="Teléfono"
                            value={telefono}
                            onChangeText={setTelefono}
                            keyboardType="phone-pad"
                        />
                        <View style={styles.editActions}>
                            <Button
                                title="Guardar"
                                onPress={handleUpdate}
                                loading={loading}
                                style={{ flex: 1 }}
                            />
                            <Button
                                title="Cancelar"
                                variant="outline"
                                onPress={() => setIsEditing(false)}
                                style={{ flex: 1 }}
                            />
                        </View>
                    </View>
                )}

                {/* ── Menú ajustes ── */}
                {!isEditing && (
                    <View style={styles.menuCard}>
                        <Text style={styles.sectionTitle}>Ajustes</Text>
                        {menuItems.map((item, idx) => (
                            <React.Fragment key={item.key}>
                                <TouchableOpacity
                                    style={styles.menuItem}
                                    onPress={item.onPress}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.menuIcon}>{item.icon}</View>
                                    <Text style={styles.menuLabel}>{item.label}</Text>
                                    <ChevronRight size={16} color={theme.colors.textTertiary} />
                                </TouchableOpacity>
                                {idx < menuItems.length - 1 && <View style={styles.divider} />}
                            </React.Fragment>
                        ))}
                    </View>
                )}

                {/* ── Admin panel ── */}
                {isAdminOrEditor && !isEditing && (
                    <View style={styles.menuCard}>
                        <Text style={styles.sectionTitle}>Administración</Text>
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => navigation.navigate('AdminNavigator', { screen: 'AdminHome' } as any)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.menuIcon, { backgroundColor: theme.colors.primary + '15' }]}>
                                <Shield size={18} color={theme.colors.primary} />
                            </View>
                            <Text style={[styles.menuLabel, { color: theme.colors.primary }]}>
                                Panel de Administración
                            </Text>
                            <ChevronRight size={16} color={theme.colors.primary} />
                        </TouchableOpacity>
                    </View>
                )}

                {/* ── Cerrar sesión ── */}
                {!isEditing && (
                    <View style={styles.menuCard}>
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() =>
                                Alert.alert('Cerrar sesión', '¿Estás seguro?', [
                                    { text: 'Cancelar', style: 'cancel' },
                                    { text: 'Salir', style: 'destructive', onPress: signOut },
                                ])
                            }
                            activeOpacity={0.7}
                        >
                            <View style={[styles.menuIcon, { backgroundColor: theme.colors.error + '15' }]}>
                                <LogOut size={18} color={theme.colors.error} />
                            </View>
                            <Text style={[styles.menuLabel, { color: theme.colors.error }]}>Cerrar Sesión</Text>
                            <ChevronRight size={16} color={theme.colors.error} />
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    scroll: { paddingBottom: 32 },

    // Hero
    heroSection: {
        alignItems: 'center',
        paddingTop: theme.spacing.lg,
        paddingBottom: theme.spacing.xl,
        paddingHorizontal: theme.spacing.lg,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        marginBottom: theme.spacing.md,
    },
    avatarWrapper: { marginBottom: theme.spacing.md },
    avatar: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...theme.shadow.md,
    },
    avatarText: { fontSize: 38, fontWeight: '800', color: '#fff' },
    name: { ...theme.typography.h2, color: theme.colors.text, marginBottom: 4, textAlign: 'center' },
    email: { ...theme.typography.bodySmall, color: theme.colors.textSecondary, marginBottom: 10 },
    badgeRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
    pointsBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.accent + '20',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: theme.borderRadius.full,
        gap: 4,
    },
    pointsBadgeText: {
        ...theme.typography.caption,
        color: theme.colors.accent,
        fontWeight: '700',
    },

    // Edit inline
    editCard: {
        backgroundColor: theme.colors.surface,
        marginHorizontal: theme.spacing.md,
        marginBottom: theme.spacing.md,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        gap: theme.spacing.sm,
        ...theme.shadow.sm,
    },
    editActions: { flexDirection: 'row', gap: theme.spacing.sm, marginTop: 4 },

    // Menu card
    menuCard: {
        backgroundColor: theme.colors.surface,
        marginHorizontal: theme.spacing.md,
        marginBottom: theme.spacing.md,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        ...theme.shadow.sm,
    },
    sectionTitle: {
        ...theme.typography.label,
        color: theme.colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: theme.spacing.sm,
        paddingHorizontal: 4,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 4,
        gap: 12,
    },
    menuIcon: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: theme.colors.primaryLight + '20',
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuLabel: { ...theme.typography.body, color: theme.colors.text, flex: 1, fontWeight: '500' },
    divider: { height: 1, backgroundColor: theme.colors.border, marginHorizontal: 4 },
});
