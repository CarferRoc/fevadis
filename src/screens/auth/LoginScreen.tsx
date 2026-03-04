import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { signInWithDni } from '../../services/authService';
import { getDniError, formatDni } from '../../utils/dniValidator';
import { FormInput } from '../../components/FormInput';
import { Button } from '../../components/Button';
import { theme } from '../../theme';

type LoginNav = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export default function LoginScreen() {
    const navigation = useNavigation<LoginNav>();
    const [dni, setDni] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [dniError, setDniError] = useState('');

    function validateForm(): boolean {
        const err = getDniError(dni);
        setDniError(err ?? '');
        if (err) return false;
        if (!password) {
            Alert.alert('Error', 'Introduce tu contraseña');
            return false;
        }
        return true;
    }

    async function handleLogin() {
        if (!validateForm()) return;
        setLoading(true);
        try {
            await signInWithDni(formatDni(dni), password);
        } catch (e: any) {
            Alert.alert('Error al iniciar sesión', e.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
        >
            {/* Logo + título */}
            <View style={styles.logoArea}>
                <View style={styles.logoCircle}>
                    <Text style={styles.logoEmoji}>🦅</Text>
                </View>
                <Text style={styles.appName}>FEVADIS</Text>
                <Text style={styles.appSub}>Plataforma de Voluntariado</Text>
            </View>

            {/* Formulario */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Iniciar sesión</Text>
                <Text style={styles.cardSub}>
                    Accede con tu DNI y contraseña
                </Text>

                <View style={styles.formFields}>
                    <FormInput
                        label="DNI"
                        placeholder="00000000A"
                        value={dni}
                        onChangeText={(v) => {
                            setDni(v);
                            if (dniError) setDniError('');
                        }}
                        autoCapitalize="characters"
                        autoCorrect={false}
                        maxLength={9}
                        error={dniError}
                    />
                    <FormInput
                        label="Contraseña"
                        placeholder="••••••••"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        textContentType="password"
                    />
                </View>

                <Button
                    title="Entrar"
                    onPress={handleLogin}
                    loading={loading}
                    size="lg"
                />

                <Button
                    title="¿No tienes cuenta? Registrarse"
                    variant="ghost"
                    onPress={() => navigation.navigate('Register')}
                />
            </View>

            <Text style={styles.footer}>
                Solo usuarios con DNI autorizado pueden acceder
            </Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: theme.colors.background,
        padding: theme.spacing.lg,
        justifyContent: 'center',
        paddingBottom: theme.spacing.xxl,
    },

    // Logo
    logoArea: {
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
    },
    logoCircle: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
        ...theme.shadow.md,
    },
    logoEmoji: {
        fontSize: 42,
    },
    appName: {
        fontSize: 28,
        fontWeight: '800',
        color: theme.colors.text,
        letterSpacing: 3,
    },
    appSub: {
        ...theme.typography.bodySmall,
        color: theme.colors.textSecondary,
        marginTop: 4,
    },

    // Card
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.lg,
        gap: theme.spacing.md,
        ...theme.shadow.md,
    },
    cardTitle: {
        ...theme.typography.h3,
        color: theme.colors.text,
    },
    cardSub: {
        ...theme.typography.bodySmall,
        color: theme.colors.textSecondary,
        marginTop: -6,
    },
    formFields: {
        gap: theme.spacing.sm,
    },

    footer: {
        ...theme.typography.caption,
        color: theme.colors.textTertiary,
        textAlign: 'center',
        marginTop: theme.spacing.lg,
    },
});
