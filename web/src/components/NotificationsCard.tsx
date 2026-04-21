import { Bell, BellOff } from 'lucide-react';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { Button } from './Button';
import { theme } from '../theme';

/**
 * Tarjeta que permite activar/desactivar notificaciones push de FCM.
 * Se muestra en la pantalla de perfil.
 */
export function NotificationsCard() {
    const { status, enable, disable } = usePushNotifications();

    const { title, description, action, tint, icon } = viewFor(status);

    return (
        <div
            style={{
                backgroundColor: theme.colors.surface,
                margin: '0 14px 8px',
                borderRadius: theme.radius.lg,
                border: `1px solid ${theme.colors.border}`,
                padding: 14,
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
            }}
        >
            <div
                style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: tint.bg,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexShrink: 0,
                }}
            >
                {icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: theme.colors.text }}>{title}</div>
                <div style={{ fontSize: 12, color: theme.colors.textSecondary, marginTop: 2, lineHeight: '16px' }}>
                    {description}
                </div>
                {action === 'enable' && (
                    <div style={{ marginTop: 10 }}>
                        <Button title="Activar" onPress={enable} size="sm" />
                    </div>
                )}
                {action === 'disable' && (
                    <div style={{ marginTop: 10 }}>
                        <Button title="Desactivar" onPress={disable} variant="outline" size="sm" />
                    </div>
                )}
            </div>
        </div>
    );
}

function viewFor(status: ReturnType<typeof usePushNotifications>['status']) {
    switch (status) {
        case 'granted':
            return {
                title: 'Notificaciones activadas',
                description: 'Recibes avisos de mensajes nuevos, actividades y documentos.',
                action: 'disable' as const,
                tint: { bg: theme.colors.successSoft },
                icon: <Bell size={18} color={theme.colors.success} />,
            };
        case 'denied':
            return {
                title: 'Permiso denegado',
                description: 'Tienes que volver a permitir notificaciones desde los ajustes del navegador.',
                action: 'none' as const,
                tint: { bg: theme.colors.errorSoft },
                icon: <BellOff size={18} color={theme.colors.error} />,
            };
        case 'unsupported':
            return {
                title: 'No disponible',
                description: 'Tu navegador no soporta notificaciones push. En iOS necesitas instalar la PWA y usar iOS 16.4 o superior.',
                action: 'none' as const,
                tint: { bg: theme.colors.surfaceMuted },
                icon: <BellOff size={18} color={theme.colors.textTertiary} />,
            };
        case 'unconfigured':
            return {
                title: 'Pendiente de configuración',
                description: 'El servidor aún no tiene la clave VAPID. Avisa al administrador.',
                action: 'none' as const,
                tint: { bg: theme.colors.warningSoft },
                icon: <BellOff size={18} color={theme.colors.warning} />,
            };
        case 'loading':
            return {
                title: 'Comprobando…',
                description: 'Un momento.',
                action: 'none' as const,
                tint: { bg: theme.colors.surfaceMuted },
                icon: <Bell size={18} color={theme.colors.textTertiary} />,
            };
        default:
            return {
                title: 'Activa las notificaciones',
                description: 'Recibe un aviso cuando haya nuevos mensajes, actividades o documentos.',
                action: 'enable' as const,
                tint: { bg: theme.colors.primaryLight },
                icon: <Bell size={18} color={theme.colors.primaryDark} />,
            };
    }
}
