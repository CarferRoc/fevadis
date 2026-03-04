import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    TouchableOpacity,
    Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { checkAuthorizedDni, register } from '../../services/authService';
import { getDniError, formatDni } from '../../utils/dniValidator';
import { FormInput } from '../../components/FormInput';
import { Button } from '../../components/Button';
import { theme } from '../../theme';

type RegisterNav = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

type Step = 'dni_check' | 'privacy' | 'form';

export default function RegisterScreen() {
    const navigation = useNavigation<RegisterNav>();
    const [step, setStep] = useState<Step>('dni_check');
    const [loading, setLoading] = useState(false);
    const [privacyAccepted, setPrivacyAccepted] = useState(false);
    const [showPolicyModal, setShowPolicyModal] = useState(false);

    // Step 1 – DNI check
    const [dniInput, setDniInput] = useState('');
    const [dniError, setDniError] = useState('');

    // Step 3 – Registration form
    const [nombre, setNombre] = useState('');
    const [apellidos, setApellidos] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // ─── Step 1: Verify DNI ───────────────────────────────────────────────────
    async function handleDniCheck() {
        const err = getDniError(dniInput);
        if (err) {
            setDniError(err);
            return;
        }
        setDniError('');
        setLoading(true);
        try {
            const authorized = await checkAuthorizedDni(formatDni(dniInput));
            if (!authorized) {
                setDniError(
                    'Este DNI no está autorizado para registrarse. Contacta con un administrador de FEVADIS.'
                );
            } else {
                setStep('privacy');
            }
        } catch (e: any) {
            Alert.alert('Error', e.message);
        } finally {
            setLoading(false);
        }
    }

    // ─── Step 2: Accept Privacy Policy ────────────────────────────────────────
    function handlePrivacyAccept() {
        if (!privacyAccepted) {
            Alert.alert(
                'Política de privacidad',
                'Debes aceptar la política de privacidad para continuar.'
            );
            return;
        }
        setStep('form');
    }

    // ─── Step 3: Register ─────────────────────────────────────────────────────
    async function handleRegister() {
        if (!nombre.trim() || !apellidos.trim() || !email.trim() || !password) {
            Alert.alert('Faltan datos', 'Por favor completa todos los campos.');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Las contraseñas no coinciden.');
            return;
        }
        if (password.length < 6) {
            Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        setLoading(true);
        try {
            await register({
                dni: formatDni(dniInput),
                nombre: nombre.trim(),
                apellidos: apellidos.trim(),
                email: email.trim().toLowerCase(),
                password,
            });
            Alert.alert(
                '¡Registro completado!',
                'Tu cuenta ha sido creada. Revisa tu email para confirmar.',
                [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
            );
        } catch (e: any) {
            Alert.alert('Error al registrarse', e.message);
        } finally {
            setLoading(false);
        }
    }

    // ─── Step indicator index ─────────────────────────────────────────────────
    const stepIndex = step === 'dni_check' ? 0 : step === 'privacy' ? 1 : 2;

    // ─── UI ───────────────────────────────────────────────────────────────────
    return (
        <>
            <ScrollView
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Crear Cuenta</Text>
                    <Text style={styles.subtitle}>
                        {step === 'dni_check'
                            ? 'Primero verificamos tu DNI'
                            : step === 'privacy'
                                ? `DNI verificado: ${formatDni(dniInput)}`
                                : `DNI verificado: ${formatDni(dniInput)}`}
                    </Text>
                </View>

                {/* Step indicator – 3 dots */}
                <View style={styles.stepRow}>
                    <View style={[styles.stepDot, styles.stepDotActive]} />
                    <View style={[styles.stepLine, stepIndex >= 1 && styles.stepLineActive]} />
                    <View style={[styles.stepDot, stepIndex >= 1 && styles.stepDotActive]} />
                    <View style={[styles.stepLine, stepIndex >= 2 && styles.stepLineActive]} />
                    <View style={[styles.stepDot, stepIndex >= 2 && styles.stepDotActive]} />
                </View>

                <View style={styles.card}>
                    {/* ── PASO 1: DNI ── */}
                    {step === 'dni_check' && (
                        <>
                            <Text style={styles.stepLabel}>Paso 1 — Verificación de DNI</Text>
                            <Text style={styles.hint}>
                                Solo los DNIs previamente autorizados por un administrador pueden
                                registrarse.
                            </Text>
                            <FormInput
                                label="DNI *"
                                placeholder="00000000A"
                                value={dniInput}
                                onChangeText={(v) => {
                                    setDniInput(v);
                                    if (dniError) setDniError('');
                                }}
                                autoCapitalize="characters"
                                autoCorrect={false}
                                maxLength={9}
                                error={dniError}
                            />
                            <Button
                                title="Verificar DNI"
                                onPress={handleDniCheck}
                                loading={loading}
                                size="lg"
                                style={styles.actionBtn}
                            />
                        </>
                    )}

                    {/* ── PASO 2: Política de privacidad ── */}
                    {step === 'privacy' && (
                        <>
                            <Text style={styles.stepLabel}>Paso 2 — Política de privacidad</Text>
                            <Text style={styles.hint}>
                                Antes de registrarte, debes leer y aceptar nuestra política de
                                privacidad conforme al RGPD.
                            </Text>

                            {/* Resumen de política */}
                            <View style={styles.policyBox}>
                                <Text style={styles.policyText}>
                                    <Text style={styles.policyBold}>Responsable:</Text> FEVADIS
                                    {'\n\n'}
                                    <Text style={styles.policyBold}>Finalidad:</Text> Gestión de
                                    socios y voluntarios, envío de comunicaciones relacionadas con
                                    actividades de la asociación.
                                    {'\n\n'}
                                    <Text style={styles.policyBold}>Legitimación:</Text>{' '}
                                    Consentimiento del interesado.
                                    {'\n\n'}
                                    <Text style={styles.policyBold}>Destinatarios:</Text> No se
                                    cederán datos a terceros salvo obligación legal.
                                    {'\n\n'}
                                    <Text style={styles.policyBold}>Derechos:</Text> Puedes
                                    ejercer tus derechos de acceso, rectificación, supresión,
                                    portabilidad y oposición contactando con{' '}
                                    <Text style={styles.policyLink}>info@fevadis.es</Text>.
                                </Text>
                                <TouchableOpacity
                                    onPress={() => setShowPolicyModal(true)}
                                    style={styles.readMoreBtn}
                                >
                                    <Text style={styles.readMoreText}>
                                        Leer política completa →
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Checkbox de aceptación */}
                            <TouchableOpacity
                                style={styles.checkRow}
                                onPress={() => setPrivacyAccepted(!privacyAccepted)}
                                activeOpacity={0.7}
                            >
                                <View
                                    style={[
                                        styles.checkbox,
                                        privacyAccepted && styles.checkboxActive,
                                    ]}
                                >
                                    {privacyAccepted && (
                                        <Text style={styles.checkmark}>✓</Text>
                                    )}
                                </View>
                                <Text style={styles.checkLabel}>
                                    He leído y acepto la política de privacidad
                                </Text>
                            </TouchableOpacity>

                            <Button
                                title="Continuar"
                                onPress={handlePrivacyAccept}
                                size="lg"
                                style={styles.actionBtn}
                            />
                            <Button
                                title="← Cambiar DNI"
                                variant="ghost"
                                onPress={() => setStep('dni_check')}
                            />
                        </>
                    )}

                    {/* ── PASO 3: Formulario ── */}
                    {step === 'form' && (
                        <>
                            <Text style={styles.stepLabel}>Paso 3 — Tus datos</Text>

                            <View style={styles.row}>
                                <View style={styles.half}>
                                    <FormInput
                                        label="Nombre *"
                                        placeholder="Juan"
                                        value={nombre}
                                        onChangeText={setNombre}
                                        autoCorrect={false}
                                    />
                                </View>
                                <View style={styles.half}>
                                    <FormInput
                                        label="Apellidos *"
                                        placeholder="García López"
                                        value={apellidos}
                                        onChangeText={setApellidos}
                                        autoCorrect={false}
                                    />
                                </View>
                            </View>

                            <FormInput
                                label="Email *"
                                placeholder="juan@email.com"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                autoCorrect={false}
                                spellCheck={false}
                                keyboardType="email-address"
                                textContentType="emailAddress"
                            />
                            <FormInput
                                label="Contraseña *"
                                placeholder="Mínimo 6 caracteres"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                textContentType="newPassword"
                            />
                            <FormInput
                                label="Confirmar contraseña *"
                                placeholder="Repite la contraseña"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry
                                textContentType="newPassword"
                            />

                            <Button
                                title="Crear cuenta"
                                onPress={handleRegister}
                                loading={loading}
                                size="lg"
                                style={styles.actionBtn}
                            />
                            <Button
                                title="← Cambiar DNI"
                                variant="ghost"
                                onPress={() => setStep('dni_check')}
                            />
                        </>
                    )}
                </View>

                <Button
                    title="¿Ya tienes cuenta? Iniciar sesión"
                    variant="ghost"
                    onPress={() => navigation.navigate('Login')}
                    style={styles.loginLink}
                />
            </ScrollView>

            {/* ── Modal: Política completa ── */}
            <Modal
                visible={showPolicyModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowPolicyModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Política de Privacidad</Text>
                        <TouchableOpacity
                            onPress={() => setShowPolicyModal(false)}
                            style={styles.modalClose}
                        >
                            <Text style={styles.modalCloseText}>✕</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView
                        style={styles.modalBody}
                        contentContainerStyle={{ paddingBottom: 40 }}
                    >
                        <Text style={styles.modalText}>
                            <Text style={styles.policyBold}>1. RESPONSABLE DEL TRATAMIENTO{'\n'}</Text>
                            FEVADIS (Federación Valenciana de Asociaciones de Personas con
                            Discapacidad Física y Órgano Sensorial), con domicilio en Valencia,
                            España.{'\n\n'}

                            <Text style={styles.policyBold}>2. DATOS QUE RECOGEMOS{'\n'}</Text>
                            Nombre y apellidos, DNI, dirección de correo electrónico y contraseña
                            cifrada.{'\n\n'}

                            <Text style={styles.policyBold}>3. FINALIDAD DEL TRATAMIENTO{'\n'}</Text>
                            • Crear y gestionar tu cuenta de usuario.{'\n'}
                            • Gestionar tu participación en actividades y eventos.{'\n'}
                            • Enviarte comunicaciones relacionadas con la asociación.{'\n\n'}

                            <Text style={styles.policyBold}>4. LEGITIMACIÓN{'\n'}</Text>
                            El consentimiento explícito que otorgas al registrarte.{'\n\n'}

                            <Text style={styles.policyBold}>5. CONSERVACIÓN{'\n'}</Text>
                            Tus datos se conservarán mientras mantengas tu cuenta activa.{'\n\n'}

                            <Text style={styles.policyBold}>6. DESTINATARIOS{'\n'}</Text>
                            No se cederán datos a terceros salvo obligación legal.{'\n\n'}

                            <Text style={styles.policyBold}>7. TUS DERECHOS{'\n'}</Text>
                            Tienes derecho a acceder, rectificar y suprimir tus datos.
                            Escríbenos a{' '}
                            <Text style={styles.policyLink}>info@fevadis.es</Text>.{'\n\n'}

                            <Text style={styles.policyBold}>8. SEGURIDAD{'\n'}</Text>
                            Aplicamos medidas técnicas y organizativas para proteger tus datos
                            frente a accesos no autorizados.
                        </Text>
                    </ScrollView>
                    <View style={styles.modalFooter}>
                        <Button
                            title="He leído la política — Aceptar"
                            onPress={() => {
                                setPrivacyAccepted(true);
                                setShowPolicyModal(false);
                            }}
                            size="lg"
                        />
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: theme.colors.background,
        padding: theme.spacing.lg,
        paddingTop: 60,
        paddingBottom: theme.spacing.xxl,
    },
    header: { marginBottom: theme.spacing.md },
    title: { ...theme.typography.h1, color: theme.colors.text },
    subtitle: { ...theme.typography.body, color: theme.colors.textSecondary, marginTop: 4 },
    stepRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
    },
    stepDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: theme.colors.border,
    },
    stepDotActive: { backgroundColor: theme.colors.primary },
    stepLine: {
        flex: 1,
        height: 2,
        backgroundColor: theme.colors.border,
        marginHorizontal: 6,
    },
    stepLineActive: { backgroundColor: theme.colors.primary },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.lg,
        gap: theme.spacing.md,
        ...theme.shadow.md,
    },
    stepLabel: { ...theme.typography.h4, color: theme.colors.text },
    hint: {
        ...theme.typography.bodySmall,
        color: theme.colors.textSecondary,
        lineHeight: 20,
    },
    actionBtn: { marginTop: theme.spacing.sm },
    row: { flexDirection: 'row', gap: theme.spacing.sm },
    half: { flex: 1 },
    loginLink: { marginTop: theme.spacing.md },

    // Privacy policy box
    policyBox: {
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    policyText: {
        ...theme.typography.bodySmall,
        color: theme.colors.textSecondary,
        lineHeight: 20,
    },
    policyBold: {
        fontWeight: '700',
        color: theme.colors.text,
    },
    policyLink: {
        color: theme.colors.primary,
    },
    readMoreBtn: {
        marginTop: theme.spacing.sm,
        alignSelf: 'flex-end',
    },
    readMoreText: {
        ...theme.typography.bodySmall,
        color: theme.colors.primary,
        fontWeight: '600',
    },

    // Checkbox
    checkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: theme.colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.surface,
    },
    checkboxActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    checkmark: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '700',
    },
    checkLabel: {
        ...theme.typography.body,
        color: theme.colors.text,
        flex: 1,
    },

    // Modal
    modalContainer: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: theme.spacing.lg,
        paddingTop: 20,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    modalTitle: { ...theme.typography.h3, color: theme.colors.text },
    modalClose: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalCloseText: {
        fontSize: 18,
        color: theme.colors.textSecondary,
    },
    modalBody: {
        flex: 1,
        padding: theme.spacing.lg,
    },
    modalText: {
        ...theme.typography.body,
        color: theme.colors.text,
        lineHeight: 24,
    },
    modalFooter: {
        padding: theme.spacing.lg,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
});
