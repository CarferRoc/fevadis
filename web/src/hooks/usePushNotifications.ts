import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '../utils/supabase';
import { useAuthStore } from '../store/useAuthStore';
import {
    isPushSupported,
    onForegroundMessage,
    requestPushToken,
} from '../utils/firebase';

export type PushStatus =
    | 'unsupported'      // el navegador no soporta PushAPI
    | 'unconfigured'     // falta VAPID key en env
    | 'denied'           // el usuario rechazó el permiso
    | 'default'          // todavía no ha decidido
    | 'granted'          // permiso concedido y token registrado
    | 'loading';

const VAPID_CONFIGURED = Boolean(import.meta.env.VITE_FIREBASE_VAPID_KEY);

async function saveToken(userId: string, token: string) {
    const { error } = await supabase
        .from('push_tokens')
        .upsert(
            {
                user_id: userId,
                token,
                platform: 'web',
                user_agent: navigator.userAgent.slice(0, 255),
                last_seen_at: new Date().toISOString(),
            },
            { onConflict: 'token' }
        );
    if (error) throw error;
}

async function deleteToken(token: string) {
    await supabase.from('push_tokens').delete().eq('token', token);
}

export function usePushNotifications() {
    const { user } = useAuthStore();
    const [status, setStatus] = useState<PushStatus>('loading');

    useEffect(() => {
        let cancelled = false;
        (async () => {
            if (!VAPID_CONFIGURED) {
                if (!cancelled) setStatus('unconfigured');
                return;
            }
            const supported = await isPushSupported();
            if (!supported) {
                if (!cancelled) setStatus('unsupported');
                return;
            }
            if (!cancelled) {
                setStatus(Notification.permission as PushStatus);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    // Listener para mensajes en primer plano (app abierta).
    useEffect(() => {
        if (status !== 'granted') return;
        const unsub = onForegroundMessage((payload) => {
            const title = payload.notification?.title ?? payload.data?.title ?? 'Nueva notificación';
            const body = payload.notification?.body ?? payload.data?.body ?? '';
            toast(title, { description: body });
        });
        return unsub;
    }, [status]);

    const enable = useCallback(async () => {
        if (!user) {
            toast.error('Inicia sesión antes de activar notificaciones');
            return;
        }
        if (!VAPID_CONFIGURED) {
            toast.error('Notificaciones no configuradas todavía');
            return;
        }
        setStatus('loading');
        try {
            const token = await requestPushToken();
            if (!token) {
                setStatus(Notification.permission as PushStatus);
                if (Notification.permission === 'denied') {
                    toast.error('Permiso denegado', {
                        description: 'Actívalo desde los ajustes del navegador.',
                    });
                }
                return;
            }
            await saveToken(user.id, token);
            setStatus('granted');
            toast.success('Notificaciones activadas');
        } catch (e: any) {
            toast.error('Error', { description: e.message ?? 'No se pudo activar' });
            setStatus('default');
        }
    }, [user]);

    const disable = useCallback(async () => {
        try {
            // Intentamos obtener el token actual para borrarlo.
            const token = await requestPushToken();
            if (token) await deleteToken(token);
            setStatus('default');
            toast.success('Notificaciones desactivadas en este dispositivo');
        } catch {
            // aunque falle, marcamos localmente como default
            setStatus('default');
        }
    }, []);

    return { status, enable, disable };
}
