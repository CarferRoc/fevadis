import { useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { IdCard, Lock, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { signInWithDni } from '../../services/authService';
import { getDniError, formatDni } from '../../utils/dniValidator';
import { FormInput } from '../../components/FormInput';
import { Button } from '../../components/Button';
import { Logo } from '../../components/Logo';
import { theme } from '../../theme';

export function LoginPage() {
    const { session } = useAuthStore();
    const navigate = useNavigate();
    const [dni, setDni] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [dniError, setDniError] = useState('');

    if (session) return <Navigate to="/" replace />;

    function validate(): boolean {
        const err = getDniError(dni);
        setDniError(err ?? '');
        if (err) return false;
        if (!password) {
            toast.error('Falta la contraseña', { description: 'Introduce tu contraseña para continuar.' });
            return false;
        }
        return true;
    }

    async function handleLogin(e?: React.FormEvent) {
        e?.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            await signInWithDni(formatDni(dni), password);
            navigate('/', { replace: true });
        } catch (e: any) {
            toast.error('No se pudo entrar', { description: e.message });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div
            style={{
                flex: 1,
                backgroundColor: theme.colors.background,
                padding: '60px 22px 40px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                minHeight: '100dvh',
            }}
        >
            <form onSubmit={handleLogin}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28 }}>
                    <Logo size={72} />
                    <div style={{ fontSize: 26, fontWeight: 800, color: theme.colors.text, letterSpacing: -0.5, marginTop: 10 }}>
                        fevadis
                    </div>
                    <div style={{ fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 }}>
                        Plataforma de voluntariado
                    </div>
                </div>

                <div
                    style={{
                        backgroundColor: theme.colors.surface,
                        borderRadius: theme.radius.xl,
                        padding: 22,
                        border: `1px solid ${theme.colors.border}`,
                        boxShadow: '0 2px 6px rgba(26,36,22,0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 16,
                    }}
                >
                    <div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: theme.colors.text, letterSpacing: -0.4 }}>
                            Bienvenid@
                        </div>
                        <div style={{ fontSize: 14, color: theme.colors.textSecondary }}>
                            Inicia sesión con tu DNI
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <FormInput
                            label="DNI"
                            placeholder="00000000A"
                            value={dni}
                            onChange={(e) => {
                                setDni(e.target.value.toUpperCase());
                                if (dniError) setDniError('');
                            }}
                            autoCapitalize="characters"
                            autoCorrect="off"
                            maxLength={9}
                            error={dniError}
                            leftIcon={<IdCard size={16} color={theme.colors.textTertiary} />}
                        />
                        <FormInput
                            label="Contraseña"
                            placeholder="••••••••"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            leftIcon={<Lock size={16} color={theme.colors.textTertiary} />}
                        />
                    </div>

                    <Button
                        title="Entrar"
                        type="submit"
                        loading={loading}
                        rightIcon={<ArrowRight size={16} color="#fff" />}
                        fullWidth
                    />
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 20 }}>
                    <span style={{ fontSize: 13, color: theme.colors.textSecondary }}>
                        ¿No tienes cuenta todavía?
                    </span>
                    <Link to="/register" style={{ textDecoration: 'none' }}>
                        <Button title="Crear cuenta" variant="outline" size="sm" />
                    </Link>
                </div>

                <div style={{ fontSize: 12, color: theme.colors.textTertiary, textAlign: 'center', marginTop: 24 }}>
                    Solo DNIs previamente autorizados
                </div>
            </form>
        </div>
    );
}
