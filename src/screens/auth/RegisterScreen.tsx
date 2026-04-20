import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    TouchableOpacity,
    Modal,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { checkAuthorizedDni, register } from '../../services/authService';
import { getDniError, formatDni } from '../../utils/dniValidator';
import { FormInput } from '../../components/FormInput';
import { Button } from '../../components/Button';
import { Logo } from '../../components/Logo';
import { theme } from '../../theme';
import { ArrowLeft, Check, ChevronRight, Shield, X } from 'lucide-react-native';

type RegisterNav = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

type Step = 'dni_check' | 'privacy' | 'form';

export default function RegisterScreen() {
    const navigation = useNavigation<RegisterNav>();
    const [step, setStep] = useState<Step>('dni_check');
    const [loading, setLoading] = useState(false);
    const [privacyAccepted, setPrivacyAccepted] = useState(false);
    const [showPolicyModal, setShowPolicyModal] = useState(false);

    const [dniInput, setDniInput] = useState('');
    const [dniError, setDniError] = useState('');

    const [nombre, setNombre] = useState('');
    const [apellidos, setApellidos] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

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
                setDniError('Este DNI no está autorizado. Contacta con FEVADIS.');
            } else {
                setStep('privacy');
            }
        } catch (e: any) {
            Alert.alert('Error', e.message);
        } finally {
            setLoading(false);
        }
    }

    function handlePrivacyAccept() {
        if (!privacyAccepted) {
            Alert.alert('Política de privacidad', 'Debes aceptar la política para continuar.');
            return;
        }
        setStep('form');
    }

    async function handleRegister() {
        if (!nombre.trim() || !apellidos.trim() || !email.trim() || !password) {
            Alert.alert('Faltan datos', 'Completa todos los campos.');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Las contraseñas no coinciden.');
            return;
        }
        if (password.length < 6) {
            Alert.alert('Error', 'Mínimo 6 caracteres.');
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
                '¡Bienvenid@!',
                'Tu cuenta se ha creado. Revisa tu email para confirmar.',
                [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
            );
        } catch (e: any) {
            Alert.alert('Error al registrarse', e.message);
        } finally {
            setLoading(false);
        }
    }

    const stepIndex = step === 'dni_check' ? 0 : step === 'privacy' ? 1 : 2;
    const steps = ['DNI', 'Política', 'Tus datos'];

    return (
        <>
            <KeyboardAvoidingView
                style={styles.safe}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.container}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => navigation.goBack()}
                    >
                        <ArrowLeft size={18} color={theme.colors.text} />
                        <Text style={styles.backText}>Volver</Text>
                    </TouchableOpacity>

                    <View style={styles.headerRow}>
                        <Logo size={40} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.title}>Crear cuenta</Text>
                            <Text style={styles.subtitle}>
                                Paso {stepIndex + 1} de 3 · {steps[stepIndex]}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.progressRow}>
                        {[0, 1, 2].map((i) => (
                            <View
                                key={i}
                                style={[
                                    styles.progressSeg,
                                    i <= stepIndex && styles.progressSegActive,
                                ]}
                            />
                        ))}
                    </View>

                    <View style={styles.card}>
                        {step === 'dni_check' && (
                            <>
                                <Text style={styles.cardTitle}>Verifica tu DNI</Text>
                                <Text style={styles.hint}>
                                    Solo los DNIs autorizados por un administrador pueden registrarse.
                                </Text>
                                <FormInput
                                    label="DNI"
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
                                    title="Verificar"
                                    onPress={handleDniCheck}
                                    loading={loading}
                                    rightIcon={<ChevronRight size={16} color="#fff" />}
                                    fullWidth
                                />
                            </>
                        )}

                        {step === 'privacy' && (
                            <>
                                <View style={styles.iconHeader}>
                                    <View style={styles.iconWrap}>
                                        <Shield size={18} color={theme.colors.primaryDark} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.cardTitle}>Política de privacidad</Text>
                                        <Text style={styles.dniChip}>
                                            DNI: {formatDni(dniInput)}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.policyBox}>
                                    <PolicyRow k="Responsable" v="FEVADIS" />
                                    <PolicyRow
                                        k="Finalidad"
                                        v="Gestión de voluntarios y comunicaciones relacionadas."
                                    />
                                    <PolicyRow
                                        k="Legitimación"
                                        v="Consentimiento del interesado."
                                    />
                                    <PolicyRow
                                        k="Derechos"
                                        v="Acceso, rectificación, supresión y oposición — info@fevadis.es"
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowPolicyModal(true)}
                                        style={styles.readMore}
                                    >
                                        <Text style={styles.readMoreText}>
                                            Leer política completa
                                        </Text>
                                        <ChevronRight size={14} color={theme.colors.primaryDark} />
                                    </TouchableOpacity>
                                </View>

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
                                        {privacyAccepted && <Check size={14} color="#fff" strokeWidth={3} />}
                                    </View>
                                    <Text style={styles.checkLabel}>
                                        He leído y acepto la política de privacidad
                                    </Text>
                                </TouchableOpacity>

                                <Button
                                    title="Continuar"
                                    onPress={handlePrivacyAccept}
                                    rightIcon={<ChevronRight size={16} color="#fff" />}
                                    fullWidth
                                />
                                <Button
                                    title="Cambiar DNI"
                                    variant="ghost"
                                    size="sm"
                                    onPress={() => setStep('dni_check')}
                                />
                            </>
                        )}

                        {step === 'form' && (
                            <>
                                <Text style={styles.cardTitle}>Tus datos</Text>
                                <Text style={styles.hint}>
                                    DNI verificado: {formatDni(dniInput)}
                                </Text>

                                <View style={styles.row}>
                                    <View style={styles.half}>
                                        <FormInput
                                            label="Nombre"
                                            placeholder="Juan"
                                            value={nombre}
                                            onChangeText={setNombre}
                                            autoCorrect={false}
                                        />
                                    </View>
                                    <View style={styles.half}>
                                        <FormInput
                                            label="Apellidos"
                                            placeholder="García López"
                                            value={apellidos}
                                            onChangeText={setApellidos}
                                            autoCorrect={false}
                                        />
                                    </View>
                                </View>

                                <FormInput
                                    label="Email"
                                    placeholder="tucorreo@email.com"
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    keyboardType="email-address"
                                    textContentType="emailAddress"
                                />
                                <FormInput
                                    label="Contraseña"
                                    placeholder="Mínimo 6 caracteres"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                    textContentType="newPassword"
                                />
                                <FormInput
                                    label="Confirmar contraseña"
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
                                    fullWidth
                                />
                                <Button
                                    title="Cambiar DNI"
                                    variant="ghost"
                                    size="sm"
                                    onPress={() => setStep('dni_check')}
                                />
                            </>
                        )}
                    </View>

                    <View style={styles.bottom}>
                        <Text style={styles.bottomText}>¿Ya tienes cuenta?</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.bottomLink}>Iniciar sesión</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

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
                            <X size={20} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView
                        style={styles.modalBody}
                        contentContainerStyle={{ paddingBottom: 40 }}
                    >
                        <Text style={styles.modalText}>
                            <Text style={styles.policyBold}>1. Responsable{'\n'}</Text>
                            FEVADIS (Federación Valenciana de Asociaciones en Favor de las Personas con
                            Discapacidad Intelectual o del Desarrollo), Valencia, España.{'\n\n'}
                            <Text style={styles.policyBold}>2. Datos que recogemos{'\n'}</Text>
                            Nombre, apellidos, DNI, email y contraseña cifrada.{'\n\n'}
                            <Text style={styles.policyBold}>3. Finalidad{'\n'}</Text>
                            Gestión de tu cuenta, participación en actividades y comunicaciones.{'\n\n'}
                            <Text style={styles.policyBold}>4. Legitimación{'\n'}</Text>
                            Consentimiento explícito al registrarte.{'\n\n'}
                            <Text style={styles.policyBold}>5. Conservación{'\n'}</Text>
                            Mientras mantengas tu cuenta activa.{'\n\n'}
                            <Text style={styles.policyBold}>6. Destinatarios{'\n'}</Text>
                            No se cederán datos salvo obligación legal.{'\n\n'}
                            <Text style={styles.policyBold}>7. Derechos{'\n'}</Text>
                            Acceso, rectificación, supresión y oposición en info@fevadis.es.{'\n\n'}
                            <Text style={styles.policyBold}>8. Seguridad{'\n'}</Text>
                            Aplicamos medidas técnicas y organizativas adecuadas.
                        </Text>
                    </ScrollView>
                    <View style={styles.modalFooter}>
                        <Button
                            title="He leído y acepto"
                            onPress={() => {
                                setPrivacyAccepted(true);
                                setShowPolicyModal(false);
                            }}
                            fullWidth
                        />
                    </View>
                </View>
            </Modal>
        </>
    );
}

function PolicyRow({ k, v }: { k: string; v: string }) {
    return (
        <View style={styles.policyRow}>
            <Text style={styles.policyKey}>{k}</Text>
            <Text style={styles.policyVal}>{v}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.background },
    container: {
        paddingHorizontal: 22,
        paddingTop: 50,
        paddingBottom: 40,
    },
    backBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        alignSelf: 'flex-start',
        paddingVertical: 6,
        paddingRight: 10,
        marginBottom: 14,
    },
    backText: {
        ...theme.typography.bodyStrong,
        color: theme.colors.text,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        marginBottom: 16,
    },
    title: {
        ...theme.typography.h1,
        color: theme.colors.text,
    },
    subtitle: {
        ...theme.typography.bodySmall,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    progressRow: {
        flexDirection: 'row',
        gap: 4,
        marginBottom: 18,
    },
    progressSeg: {
        flex: 1,
        height: 3,
        borderRadius: 2,
        backgroundColor: theme.colors.surfaceMuted,
    },
    progressSegActive: {
        backgroundColor: theme.colors.primary,
    },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.xl,
        padding: 20,
        borderWidth: 1,
        borderColor: theme.colors.border,
        gap: 14,
        ...theme.shadow.sm,
    },
    cardTitle: {
        ...theme.typography.h3,
        color: theme.colors.text,
    },
    hint: {
        ...theme.typography.bodySmall,
        color: theme.colors.textSecondary,
        marginTop: -10,
    },
    iconHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconWrap: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: theme.colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dniChip: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.primaryDark,
        marginTop: 2,
    },
    row: { flexDirection: 'row', gap: 10 },
    half: { flex: 1 },

    policyBox: {
        backgroundColor: theme.colors.primarySoft,
        borderRadius: theme.radius.md,
        padding: 14,
        gap: 10,
        borderWidth: 1,
        borderColor: theme.colors.primaryLight,
    },
    policyRow: { gap: 2 },
    policyKey: {
        ...theme.typography.overline,
        color: theme.colors.primaryDark,
    },
    policyVal: {
        ...theme.typography.bodySmall,
        color: theme.colors.text,
    },
    policyBold: {
        fontWeight: '700',
        color: theme.colors.text,
    },
    readMore: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        alignSelf: 'flex-start',
        marginTop: 4,
    },
    readMoreText: {
        ...theme.typography.bodySmall,
        color: theme.colors.primaryDark,
        fontWeight: '700',
    },
    checkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 1.5,
        borderColor: theme.colors.borderStrong,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.surface,
    },
    checkboxActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    checkLabel: {
        ...theme.typography.body,
        color: theme.colors.text,
        flex: 1,
    },
    bottom: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
        marginTop: 20,
    },
    bottomText: {
        ...theme.typography.bodySmall,
        color: theme.colors.textSecondary,
    },
    bottomLink: {
        ...theme.typography.bodyStrong,
        color: theme.colors.primaryDark,
    },

    modalContainer: { flex: 1, backgroundColor: theme.colors.background },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    modalTitle: { ...theme.typography.h3, color: theme.colors.text },
    modalClose: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
        backgroundColor: theme.colors.surfaceAlt,
    },
    modalBody: { flex: 1, padding: 20 },
    modalText: { ...theme.typography.body, color: theme.colors.text, lineHeight: 22 },
    modalFooter: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
});
