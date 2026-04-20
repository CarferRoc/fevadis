import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Check, ChevronRight, Shield, X } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { checkAuthorizedDni, register } from '../../services/authService';
import { getDniError, formatDni } from '../../utils/dniValidator';
import { FormInput } from '../../components/FormInput';
import { Button } from '../../components/Button';
import { Logo } from '../../components/Logo';
import { theme } from '../../theme';

type Step = 'dni_check' | 'privacy' | 'form';

export function RegisterPage() {
    const { session } = useAuthStore();
    const navigate = useNavigate();

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

    if (session) return <Navigate to="/" replace />;

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
            toast.error('Error', { description: e.message });
        } finally {
            setLoading(false);
        }
    }

    function handlePrivacyAccept() {
        if (!privacyAccepted) {
            toast.error('Política de privacidad', { description: 'Debes aceptar la política para continuar.' });
            return;
        }
        setStep('form');
    }

    async function handleRegister() {
        if (!nombre.trim() || !apellidos.trim() || !email.trim() || !password) {
            toast.error('Faltan datos', { description: 'Completa todos los campos.' });
            return;
        }
        if (password !== confirmPassword) {
            toast.error('Error', { description: 'Las contraseñas no coinciden.' });
            return;
        }
        if (password.length < 6) {
            toast.error('Error', { description: 'Mínimo 6 caracteres.' });
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
            toast.success('¡Bienvenid@!', { description: 'Tu cuenta se ha creado. Revisa tu email para confirmar.' });
            navigate('/login', { replace: true });
        } catch (e: any) {
            toast.error('Error al registrarse', { description: e.message });
        } finally {
            setLoading(false);
        }
    }

    const stepIndex = step === 'dni_check' ? 0 : step === 'privacy' ? 1 : 2;
    const steps = ['DNI', 'Política', 'Tus datos'];

    return (
        <>
            <div
                style={{
                    flex: 1,
                    backgroundColor: theme.colors.background,
                    padding: '50px 22px 40px',
                    overflowY: 'auto',
                    minHeight: '100dvh',
                }}
            >
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '6px 10px 6px 0',
                        marginBottom: 14,
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: theme.colors.text,
                    }}
                >
                    <ArrowLeft size={18} color={theme.colors.text} />
                    <span style={{ fontSize: 14, fontWeight: 600 }}>Volver</span>
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                    <Logo size={40} />
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 24, fontWeight: 800, color: theme.colors.text, letterSpacing: -0.4 }}>
                            Crear cuenta
                        </div>
                        <div style={{ fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 }}>
                            Paso {stepIndex + 1} de 3 · {steps[stepIndex]}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 4, marginBottom: 18 }}>
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            style={{
                                flex: 1,
                                height: 3,
                                borderRadius: 2,
                                backgroundColor: i <= stepIndex ? theme.colors.primary : theme.colors.surfaceMuted,
                            }}
                        />
                    ))}
                </div>

                <div
                    style={{
                        backgroundColor: theme.colors.surface,
                        borderRadius: theme.radius.xl,
                        padding: 20,
                        border: `1px solid ${theme.colors.border}`,
                        boxShadow: '0 2px 6px rgba(26,36,22,0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 14,
                    }}
                >
                    {step === 'dni_check' && (
                        <>
                            <div style={{ fontSize: 17, fontWeight: 700, color: theme.colors.text }}>
                                Verifica tu DNI
                            </div>
                            <div style={{ fontSize: 13, color: theme.colors.textSecondary, marginTop: -10 }}>
                                Solo los DNIs autorizados por un administrador pueden registrarse.
                            </div>
                            <FormInput
                                label="DNI"
                                placeholder="00000000A"
                                value={dniInput}
                                onChange={(e) => {
                                    setDniInput(e.target.value.toUpperCase());
                                    if (dniError) setDniError('');
                                }}
                                autoCapitalize="characters"
                                autoCorrect="off"
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div
                                    style={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: 10,
                                        backgroundColor: theme.colors.primaryLight,
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Shield size={18} color={theme.colors.primaryDark} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 17, fontWeight: 700, color: theme.colors.text }}>
                                        Política de privacidad
                                    </div>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: theme.colors.primaryDark, marginTop: 2 }}>
                                        DNI: {formatDni(dniInput)}
                                    </div>
                                </div>
                            </div>

                            <div
                                style={{
                                    backgroundColor: theme.colors.primarySoft,
                                    borderRadius: theme.radius.md,
                                    padding: 14,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 10,
                                    border: `1px solid ${theme.colors.primaryLight}`,
                                }}
                            >
                                <PolicyRow k="Responsable" v="FEVADIS" />
                                <PolicyRow k="Finalidad" v="Gestión de voluntarios y comunicaciones relacionadas." />
                                <PolicyRow k="Legitimación" v="Consentimiento del interesado." />
                                <PolicyRow k="Derechos" v="Acceso, rectificación, supresión y oposición — info@fevadis.es" />
                                <button
                                    onClick={() => setShowPolicyModal(true)}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: 0,
                                        marginTop: 4,
                                    }}
                                >
                                    <span style={{ fontSize: 13, fontWeight: 700, color: theme.colors.primaryDark }}>
                                        Leer política completa
                                    </span>
                                    <ChevronRight size={14} color={theme.colors.primaryDark} />
                                </button>
                            </div>

                            <div
                                onClick={() => setPrivacyAccepted(!privacyAccepted)}
                                style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                            >
                                <div
                                    style={{
                                        width: 22,
                                        height: 22,
                                        borderRadius: 6,
                                        border: `1.5px solid ${privacyAccepted ? theme.colors.primary : theme.colors.borderStrong}`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: privacyAccepted ? theme.colors.primary : theme.colors.surface,
                                        flexShrink: 0,
                                    }}
                                >
                                    {privacyAccepted && <Check size={14} color="#fff" strokeWidth={3} />}
                                </div>
                                <span style={{ fontSize: 14, color: theme.colors.text, flex: 1 }}>
                                    He leído y acepto la política de privacidad
                                </span>
                            </div>

                            <Button
                                title="Continuar"
                                onPress={handlePrivacyAccept}
                                rightIcon={<ChevronRight size={16} color="#fff" />}
                                fullWidth
                            />
                            <Button title="Cambiar DNI" variant="ghost" size="sm" onPress={() => setStep('dni_check')} />
                        </>
                    )}

                    {step === 'form' && (
                        <>
                            <div style={{ fontSize: 17, fontWeight: 700, color: theme.colors.text }}>Tus datos</div>
                            <div style={{ fontSize: 13, color: theme.colors.textSecondary, marginTop: -10 }}>
                                DNI verificado: {formatDni(dniInput)}
                            </div>

                            <div style={{ display: 'flex', gap: 10 }}>
                                <div style={{ flex: 1 }}>
                                    <FormInput
                                        label="Nombre"
                                        placeholder="Juan"
                                        value={nombre}
                                        onChange={(e) => setNombre(e.target.value)}
                                        autoCorrect="off"
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <FormInput
                                        label="Apellidos"
                                        placeholder="García López"
                                        value={apellidos}
                                        onChange={(e) => setApellidos(e.target.value)}
                                        autoCorrect="off"
                                    />
                                </div>
                            </div>

                            <FormInput
                                label="Email"
                                placeholder="tucorreo@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoCapitalize="off"
                                autoCorrect="off"
                                type="email"
                                autoComplete="email"
                            />
                            <FormInput
                                label="Contraseña"
                                placeholder="Mínimo 6 caracteres"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                type="password"
                                autoComplete="new-password"
                            />
                            <FormInput
                                label="Confirmar contraseña"
                                placeholder="Repite la contraseña"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                type="password"
                                autoComplete="new-password"
                            />

                            <Button title="Crear cuenta" onPress={handleRegister} loading={loading} fullWidth />
                            <Button title="Cambiar DNI" variant="ghost" size="sm" onPress={() => setStep('dni_check')} />
                        </>
                    )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 20 }}>
                    <span style={{ fontSize: 13, color: theme.colors.textSecondary }}>¿Ya tienes cuenta?</span>
                    <Link to="/login" style={{ fontSize: 14, fontWeight: 600, color: theme.colors.primaryDark, textDecoration: 'none' }}>
                        Iniciar sesión
                    </Link>
                </div>
            </div>

            {showPolicyModal && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 100,
                        backgroundColor: 'rgba(0,0,0,0.4)',
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'center',
                    }}
                    onClick={() => setShowPolicyModal(false)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: '100%',
                            maxWidth: 520,
                            maxHeight: '92dvh',
                            backgroundColor: theme.colors.background,
                            borderTopLeftRadius: 20,
                            borderTopRightRadius: 20,
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottom: `1px solid ${theme.colors.border}` }}>
                            <div style={{ fontSize: 17, fontWeight: 700, color: theme.colors.text }}>Política de Privacidad</div>
                            <button
                                onClick={() => setShowPolicyModal(false)}
                                style={{
                                    width: 32,
                                    height: 32,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: 16,
                                    backgroundColor: theme.colors.surfaceAlt,
                                    border: 'none',
                                    cursor: 'pointer',
                                }}
                            >
                                <X size={20} color={theme.colors.textSecondary} />
                            </button>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: 20, fontSize: 14, lineHeight: '22px', color: theme.colors.text }}>
                            <p><b>1. Responsable</b><br />
                                FEVADIS (Federación Valenciana de Asociaciones en Favor de las Personas con Discapacidad Intelectual o del Desarrollo), Valencia, España.</p>
                            <p><b>2. Datos que recogemos</b><br />
                                Nombre, apellidos, DNI, email y contraseña cifrada.</p>
                            <p><b>3. Finalidad</b><br />
                                Gestión de tu cuenta, participación en actividades y comunicaciones.</p>
                            <p><b>4. Legitimación</b><br />
                                Consentimiento explícito al registrarte.</p>
                            <p><b>5. Conservación</b><br />
                                Mientras mantengas tu cuenta activa.</p>
                            <p><b>6. Destinatarios</b><br />
                                No se cederán datos salvo obligación legal.</p>
                            <p><b>7. Derechos</b><br />
                                Acceso, rectificación, supresión y oposición en info@fevadis.es.</p>
                            <p><b>8. Seguridad</b><br />
                                Aplicamos medidas técnicas y organizativas adecuadas.</p>
                        </div>
                        <div style={{ padding: 20, borderTop: `1px solid ${theme.colors.border}` }}>
                            <Button
                                title="He leído y acepto"
                                onPress={() => {
                                    setPrivacyAccepted(true);
                                    setShowPolicyModal(false);
                                }}
                                fullWidth
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function PolicyRow({ k, v }: { k: string; v: string }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, color: theme.colors.primaryDark, textTransform: 'uppercase' }}>
                {k}
            </span>
            <span style={{ fontSize: 13, color: theme.colors.text }}>{v}</span>
        </div>
    );
}
