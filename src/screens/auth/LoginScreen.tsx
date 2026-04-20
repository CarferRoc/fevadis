import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { signInWithDni } from '../../services/authService';
import { getDniError, formatDni } from '../../utils/dniValidator';
import { FormInput } from '../../components/FormInput';
import { Button } from '../../components/Button';
import { Logo } from '../../components/Logo';
import { theme } from '../../theme';
import { IdCard, Lock, ArrowRight } from 'lucide-react-native';

type LoginNav = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export default function LoginScreen() {
    const navigation = useNavigation<LoginNav>();
    const [dni, setDni] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [dniError, setDniError] = useState('');

    function validate(): boolean {
        const err = getDniError(dni);
        setDniError(err ?? '');
        if (err) return false;
        if (!password) {
            Alert.alert('Falta la contraseña', 'Introduce tu contraseña para continuar.');
            return false;
        }
        return true;
    }

    async function handleLogin() {
        if (!validate()) return;
        setLoading(true);
        try {
            await signInWithDni(formatDni(dni), password);
        } catch (e: any) {
            Alert.alert('No se pudo entrar', e.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <KeyboardAvoidingView
            style={styles.safe}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.hero}>
                    <Logo size={72} />
                    <Text style={styles.brand}>fevadis</Text>
                    <Text style={styles.tagline}>Plataforma de voluntariado</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.title}>Bienvenid@</Text>
                    <Text style={styles.subtitle}>Inicia sesión con tu DNI</Text>

                    <View style={styles.fields}>
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
                            leftIcon={<IdCard size={16} color={theme.colors.textTertiary} />}
                        />
                        <FormInput
                            label="Contraseña"
                            placeholder="••••••••"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            textContentType="password"
                            leftIcon={<Lock size={16} color={theme.colors.textTertiary} />}
                        />
                    </View>

                    <Button
                        title="Entrar"
                        onPress={handleLogin}
                        loading={loading}
                        rightIcon={<ArrowRight size={16} color="#fff" />}
                        fullWidth
                    />
                </View>

                <View style={styles.bottom}>
                    <Text style={styles.bottomText}>¿No tienes cuenta todavía?</Text>
                    <Button
                        title="Crear cuenta"
                        variant="outline"
                        size="sm"
                        onPress={() => navigation.navigate('Register')}
                    />
                </View>

                <Text style={styles.legal}>
                    Solo DNIs previamente autorizados
                </Text>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    container: {
        flexGrow: 1,
        paddingHorizontal: 22,
        paddingTop: 60,
        paddingBottom: 40,
        justifyContent: 'center',
    },
    hero: {
        alignItems: 'center',
        marginBottom: 28,
    },
    brand: {
        fontSize: 26,
        fontWeight: '800',
        color: theme.colors.text,
        letterSpacing: -0.5,
        marginTop: 10,
    },
    tagline: {
        ...theme.typography.bodySmall,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.xl,
        padding: 22,
        borderWidth: 1,
        borderColor: theme.colors.border,
        gap: 16,
        ...theme.shadow.sm,
    },
    title: {
        ...theme.typography.h1,
        color: theme.colors.text,
    },
    subtitle: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        marginTop: -10,
    },
    fields: {
        gap: 12,
    },
    bottom: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        marginTop: 20,
    },
    bottomText: {
        ...theme.typography.bodySmall,
        color: theme.colors.textSecondary,
    },
    legal: {
        ...theme.typography.caption,
        color: theme.colors.textTertiary,
        textAlign: 'center',
        marginTop: 24,
    },
});
