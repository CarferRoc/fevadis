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
    | 'default'          // puede activar, no hay token aún
    | 'granted'          // permiso concedido Y token guardado en DB
    | 'loading';

const VAPID_CONFIGURED = Boolean(import.meta.env.VITE_FIREBASE_VAPID_KEY);
const FIREBASE_SW_SCOPE = '/firebase-cloud-messaging-push-scope';

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

async function hasTokenInDb(userId: string): Promise<boolean> {
    const { data, error } = await supabase
        .from('push_tokens')
        .select('token')
        .eq('user_id', userId)
        .limit(1);
    if (error) return false;
    return (data?.length ?? 0) > 0;
}

async function unsubscribeBrowser() {
    try {
        const reg = await navigator.serviceWorker.getRegistration(FIREBASE_SW_SCOPE);
        const subscription = await reg?.pushManager.getSubscription();
        if (subscription) await subscription.unsubscribe();
    } catch (e) {
        console.warn('[push] unsubscribe browser failed', e);
    }
}

export function usePushNotifications() {
    const { user } = useAuthStore();
    const [status, setStatus] = useState<PushStatus>('loading');

    // Estado inicial: combina permiso del navegador + existencia de token en DB.
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
            const perm = Notification.permission;
            if (perm === 'denied') {
                if (!cancelled) setStatus('denied');
                return;
            }
            if (perm !== 'granted' || !user) {
                if (!cancelled) setStatus('default');
                return;
            }
            // Permiso concedido: miramos si realmente hay token en DB.
            const hasToken = await hasTokenInDb(user.id);
            if (!cancelled) setStatus(hasToken ? 'granted' : 'default');
        })();
        return () => {
            cancelled = true;
        };
    }, [user]);

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
                const perm = Notification.permission;
                if (perm === 'denied') {
                    setStatus('denied');
                    toast.error('Permiso denegado', {
                        description: 'Actívalo desde los ajustes del navegador.',
                    });
                } else {
                    setStatus('default');
                    toast.error('No se pudo obtener el token de FCM');
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
        setStatus('loading');
        try {
            // 1) Desuscribe el PushManager del navegador para que FCM deje
            //    de poder entregar a este dispositivo.
            await unsubscribeBrowser();
            // 2) Borra TODOS los tokens de este usuario en la BBDD
            //    (puede haber varios si cambió de navegador / dispositivo).
            if (user) {
                await supabase.from('push_tokens').delete().eq('user_id', user.id);
            }
            setStatus('default');
            toast.success('Notificaciones desactivadas');
        } catch (e: any) {
            console.error('[push] disable error', e);
            setStatus('default');
            toast.error('Error al desactivar', { description: e.message ?? '' });
        }
    }, [user]);

    return { status, enable, disable };
}
