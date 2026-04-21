import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
    getMessaging,
    getToken,
    onMessage,
    isSupported,
    type Messaging,
} from 'firebase/messaging';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined;

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

function getApp(): FirebaseApp | null {
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) return null;
    if (!app) app = initializeApp(firebaseConfig);
    return app;
}

/**
 * Devuelve la instancia de Messaging si el navegador la soporta. Null si no.
 */
export async function getMessagingSafe(): Promise<Messaging | null> {
    try {
        const supported = await isSupported();
        if (!supported) return null;
        const a = getApp();
        if (!a) return null;
        if (!messaging) messaging = getMessaging(a);
        return messaging;
    } catch {
        return null;
    }
}

export async function isPushSupported(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    if (!('serviceWorker' in navigator)) return false;
    if (!('PushManager' in window)) return false;
    return await isSupported();
}

/**
 * Solicita permiso al usuario y devuelve el token FCM si lo concede.
 * Registra el service worker en /firebase-messaging-sw.js automáticamente.
 */
export async function requestPushToken(): Promise<string | null> {
    if (!VAPID_KEY) {
        console.warn('[push] VITE_FIREBASE_VAPID_KEY no está configurada');
        return null;
    }

    const m = await getMessagingSafe();
    if (!m) return null;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;

    // Registra manualmente el SW de Firebase para tener control del scope
    // y no pisar al SW de vite-plugin-pwa (scopes distintos).
    const registration = await navigator.serviceWorker.register(
        '/firebase-messaging-sw.js',
        { scope: '/firebase-cloud-messaging-push-scope' }
    );

    // Espera a que el SW esté ACTIVO antes de pedir el token.
    // Sin esto, PushManager.subscribe falla con AbortError.
    if (!registration.active) {
        await new Promise<void>((resolve) => {
            const worker = registration.installing ?? registration.waiting;
            if (!worker) {
                // Fallback: dale un margen al browser
                setTimeout(resolve, 500);
                return;
            }
            const onChange = () => {
                if (worker.state === 'activated') {
                    worker.removeEventListener('statechange', onChange);
                    resolve();
                }
            };
            worker.addEventListener('statechange', onChange);
            // Timeout de seguridad por si nunca llega a 'activated'
            setTimeout(resolve, 3000);
        });
    }

    try {
        const token = await getToken(m, {
            vapidKey: VAPID_KEY,
            serviceWorkerRegistration: registration,
        });
        return token || null;
    } catch (err) {
        console.error('[push] getToken error', err);
        return null;
    }
}

/**
 * Suscribe un listener a mensajes que llegan con la app en primer plano.
 * Devuelve una función para desuscribir.
 */
export function onForegroundMessage(cb: (payload: any) => void): () => void {
    let unsub: (() => void) | null = null;
    getMessagingSafe().then((m) => {
        if (!m) return;
        unsub = onMessage(m, cb);
    });
    return () => {
        if (unsub) unsub();
    };
}
