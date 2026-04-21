import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.png', 'apple-touch-icon.png', 'logo.png'],
            manifest: {
                name: 'Fevadis · Plataforma de voluntariado',
                short_name: 'Fevadis',
                description: 'App oficial de voluntariado FEVADIS: actividades, chats, inscripciones y documentos.',
                lang: 'es',
                dir: 'ltr',
                theme_color: '#7AB13D',
                background_color: '#FAFBF7',
                display: 'standalone',
                display_override: ['standalone', 'minimal-ui'],
                orientation: 'portrait',
                scope: '/',
                start_url: '/',
                categories: ['social', 'productivity', 'education'],
                icons: [
                    {
                        src: 'pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                        purpose: 'any',
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any',
                    },
                    {
                        src: 'pwa-maskable-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'maskable',
                    },
                ],
                shortcuts: [
                    {
                        name: 'Actividades',
                        short_name: 'Actividades',
                        url: '/activities',
                        icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }],
                    },
                    {
                        name: 'Chats',
                        short_name: 'Chats',
                        url: '/chats',
                        icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }],
                    },
                ],
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/[a-z0-9-]+\.supabase\.co\/rest\/v1\/.*/i,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'supabase-rest-cache',
                            expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 },
                            networkTimeoutSeconds: 5,
                        },
                    },
                    {
                        urlPattern: /^https:\/\/[a-z0-9-]+\.supabase\.co\/storage\/v1\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'supabase-storage-cache',
                            expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 },
                        },
                    },
                ],
            },
            devOptions: { enabled: false },
        }),
    ],
    server: {
        port: 5173,
        host: true,
    },
});
