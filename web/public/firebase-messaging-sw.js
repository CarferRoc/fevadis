/* global importScripts, firebase */
/*
 * Service Worker de Firebase Cloud Messaging.
 *
 * Se registra con scope /firebase-cloud-messaging-push-scope para no
 * colisionar con el SW de vite-plugin-pwa (que corre en scope /).
 *
 * Los valores de config NO son secretos — Firebase los considera
 * identificadores públicos de proyecto.
 */

importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: 'AIzaSyCC_LSGwuEUVUhGNBaYQI6Gfl5ZOuABn5w',
    authDomain: 'fevadis-e7855.firebaseapp.com',
    projectId: 'fevadis-e7855',
    storageBucket: 'fevadis-e7855.firebasestorage.app',
    messagingSenderId: '805619629612',
    appId: '1:805619629612:web:f76aafb432951adae5db89',
});

const messaging = firebase.messaging();

// Handler para mensajes que llegan con la app cerrada o en segundo plano.
// Si el payload viene con `notification`, el SDK mostrará la notificación
// automáticamente. Añadimos un handler por si mandamos `data-only` messages.
messaging.onBackgroundMessage((payload) => {
    const title = payload.notification?.title ?? payload.data?.title ?? 'Fevadis';
    const body = payload.notification?.body ?? payload.data?.body ?? '';
    const url = payload.fcmOptions?.link ?? payload.data?.url ?? '/';

    self.registration.showNotification(title, {
        body,
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        data: { url },
        tag: payload.data?.tag ?? undefined,
    });
});

// Al clicar la notificación, abre / enfoca la pestaña en la ruta indicada.
self.addEventListener('notificationclick', (event) => {
    const url = (event.notification.data && event.notification.data.url) || '/';
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            for (const client of windowClients) {
                if ('focus' in client) {
                    client.navigate(url);
                    return client.focus();
                }
            }
            if (clients.openWindow) return clients.openWindow(url);
        })
    );
});
