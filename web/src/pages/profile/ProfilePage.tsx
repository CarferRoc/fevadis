import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { User, ChevronRight, FolderOpen, Activity, LogOut, Shield, Gift } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../utils/supabase';
import { theme } from '../../theme';
import { FormInput } from '../../components/FormInput';
import { Button } from '../../components/Button';
import { RoleBadge } from '../../components/RoleBadge';
import { NotificationsCard } from '../../components/NotificationsCard';
import { registrationsService } from '../../services/registrationsService';

export function ProfilePage() {
    const { profile, user, signOut, fetchProfile, isAdminOrEditor } = useAuthStore();
    const navigate = useNavigate();

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

    useEffect(() => {
        if (!user?.id) return;
        registrationsService
            .getMyRegistrations(user.id)
            .then((regs) => {
                const asistidos = regs.filter((r) => r.status === 'aceptado' && r.attendance === 'asistio');
                setPuntos(asistidos.length * 10);
            })
            .catch(console.error);
    }, [user?.id]);

    async function handleUpdate() {
        if (!user?.id) return;
        setLoading(true);
        const { error } = await supabase.from('profiles').update({ nombre, apellidos, telefono }).eq('user_id', user.id);
        if (error) {
            toast.error('Error', { description: error.message });
        } else {
            toast.success('Guardado', { description: 'Tu perfil se ha actualizado.' });
            setIsEditing(false);
            fetchProfile();
        }
        setLoading(false);
    }

    function handleSignOut() {
        if (!window.confirm('¿Estás seguro de que quieres cerrar sesión?')) return;
        signOut();
    }

    const initials = [profile?.nombre?.[0], profile?.apellidos?.[0]].filter(Boolean).join('').toUpperCase() || '?';

    const menuItems = [
        { key: 'personal', icon: User, tint: theme.colors.primaryDark, tintBg: theme.colors.primaryLight, label: 'Información Personal', onClick: () => setIsEditing(true) },
        { key: 'docs', icon: FolderOpen, tint: theme.colors.catCampamentos, tintBg: theme.colors.catCampamentosSoft, label: 'Mis Documentos', onClick: () => navigate('/profile/documents') },
        { key: 'rewards', icon: Gift, tint: theme.colors.warning, tintBg: theme.colors.warningSoft, label: 'Recompensas', onClick: () => navigate(`/profile/rewards?puntos=${puntos}`) },
        { key: 'activity', icon: Activity, tint: theme.colors.catFormaciones, tintBg: theme.colors.catFormacionesSoft, label: 'Mi Actividad', onClick: () => navigate('/profile/registrations') },
    ] as const;

    return (
        <div style={{ flex: 1, backgroundColor: theme.colors.background, display: 'flex', flexDirection: 'column', overflowY: 'auto', paddingBottom: 32 }}>
            <div style={{ padding: '10px 18px 4px', paddingTop: 'calc(env(safe-area-inset-top, 0px) + 10px)' }}>
                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.6, color: theme.colors.textSecondary, textTransform: 'uppercase' }}>
                    Mi perfil
                </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '18px 18px 24px' }}>
                <div
                    style={{
                        width: 84,
                        height: 84,
                        borderRadius: 42,
                        backgroundColor: theme.colors.primary,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: 12,
                        boxShadow: '0 2px 6px rgba(26,36,22,0.15)',
                    }}
                >
                    <span style={{ fontSize: 30, fontWeight: 800, color: '#fff' }}>{initials}</span>
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: theme.colors.text, textAlign: 'center' }}>
                    {profile?.nombre ?? ''} {profile?.apellidos ?? ''}
                </div>
                <div style={{ fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 }}>{profile?.email ?? user?.email}</div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 10 }}>
                    {profile?.role && <RoleBadge role={profile.role} />}
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, backgroundColor: theme.colors.warningSoft, padding: '3px 9px', borderRadius: 9999 }}>
                        <Gift size={12} color={theme.colors.warning} />
                        <span style={{ fontSize: 12, fontWeight: 700, color: theme.colors.warning }}>{puntos} pts</span>
                    </span>
                </div>
            </div>

            {isEditing ? (
                <div
                    style={{
                        backgroundColor: theme.colors.surface,
                        margin: '0 14px 8px',
                        borderRadius: theme.radius.lg,
                        border: `1px solid ${theme.colors.border}`,
                        padding: '10px 12px',
                    }}
                >
                    <div style={{ fontSize: 15, fontWeight: 700, color: theme.colors.text, marginBottom: 12 }}>Editar información</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <FormInput label="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
                        <FormInput label="Apellidos" value={apellidos} onChange={(e) => setApellidos(e.target.value)} />
                        <FormInput label="Teléfono" value={telefono} onChange={(e) => setTelefono(e.target.value)} type="tel" />
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                        <Button title="Cancelar" variant="outline" onPress={() => setIsEditing(false)} style={{ flex: 1 }} />
                        <Button title="Guardar" onPress={handleUpdate} loading={loading} style={{ flex: 1 }} />
                    </div>
                </div>
            ) : (
                <>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, color: theme.colors.textTertiary, margin: '10px 18px 6px', textTransform: 'uppercase' }}>
                        NOTIFICACIONES
                    </div>
                    <NotificationsCard />

                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, color: theme.colors.textTertiary, margin: '10px 18px 6px', textTransform: 'uppercase' }}>
                        AJUSTES
                    </div>
                    <div style={cardStyle}>
                        {menuItems.map((item, idx) => (
                            <div key={item.key}>
                                <MenuItem icon={item.icon} tint={item.tint} tintBg={item.tintBg} label={item.label} onClick={item.onClick} />
                                {idx < menuItems.length - 1 && <div style={dividerStyle} />}
                            </div>
                        ))}
                    </div>

                    {isAdminOrEditor && (
                        <>
                            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, color: theme.colors.textTertiary, margin: '10px 18px 6px', textTransform: 'uppercase' }}>
                                ADMINISTRACIÓN
                            </div>
                            <div style={cardStyle}>
                                <MenuItem
                                    icon={Shield}
                                    tint={theme.colors.roleAdmin}
                                    tintBg={theme.colors.roleAdminSoft}
                                    label="Panel de administración"
                                    labelColor={theme.colors.roleAdmin}
                                    labelBold
                                    onClick={() => navigate('/admin')}
                                />
                            </div>
                        </>
                    )}

                    <div style={cardStyle}>
                        <MenuItem
                            icon={LogOut}
                            tint={theme.colors.error}
                            tintBg={theme.colors.errorSoft}
                            label="Cerrar sesión"
                            labelColor={theme.colors.error}
                            labelBold
                            hideChevron
                            onClick={handleSignOut}
                        />
                    </div>
                </>
            )}
        </div>
    );
}

const cardStyle: React.CSSProperties = {
    backgroundColor: theme.colors.surface,
    margin: '0 14px 8px',
    borderRadius: theme.radius.lg,
    border: `1px solid ${theme.colors.border}`,
    padding: 4,
};

const dividerStyle: React.CSSProperties = {
    height: 1,
    backgroundColor: theme.colors.border,
    margin: '0 12px',
};

function MenuItem({
    icon: Icon,
    tint,
    tintBg,
    label,
    labelColor,
    labelBold,
    hideChevron,
    onClick,
}: {
    icon: any;
    tint: string;
    tintBg: string;
    label: string;
    labelColor?: string;
    labelBold?: boolean;
    hideChevron?: boolean;
    onClick: () => void;
}) {
    return (
        <div
            onClick={onClick}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '11px 12px',
                borderRadius: theme.radius.md,
                cursor: 'pointer',
            }}
        >
            <div
                style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    backgroundColor: tintBg,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexShrink: 0,
                }}
            >
                <Icon size={16} color={tint} strokeWidth={2.2} />
            </div>
            <span style={{ flex: 1, fontSize: 14, fontWeight: labelBold ? 700 : 600, color: labelColor ?? theme.colors.text }}>
                {label}
            </span>
            {!hideChevron && <ChevronRight size={16} color={labelColor ?? theme.colors.textTertiary} />}
        </div>
    );
}
