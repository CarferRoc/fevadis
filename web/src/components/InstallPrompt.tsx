import { useEffect, useState } from 'react';
import { Download, Share, Plus, X } from 'lucide-react';
import { theme } from '../theme';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

type Mode = 'none' | 'native' | 'ios-hint';

const DISMISS_KEY = 'fevadis-install-dismissed-at';
const DISMISS_COOLDOWN_MS = 1000 * 60 * 60 * 24 * 7; // 7 días

function isIOS() {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent;
    return /iPad|iPhone|iPod/.test(ua) && !('MSStream' in window);
}

function isStandalone() {
    if (typeof window === 'undefined') return false;
    return (
        window.matchMedia('(display-mode: standalone)').matches ||
        (navigator as any).standalone === true
    );
}

function wasRecentlyDismissed() {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const when = parseInt(raw, 10);
    if (!Number.isFinite(when)) return false;
    return Date.now() - when < DISMISS_COOLDOWN_MS;
}

/**
 * Banner de instalación de PWA.
 *
 *  - En Chrome / Edge / Android: espera al evento `beforeinstallprompt`
 *    y muestra un botón que lanza el diálogo nativo.
 *  - En iOS Safari: muestra instrucciones para "Añadir a pantalla de inicio".
 *  - Si la app ya está instalada (standalone), no muestra nada.
 *  - Si el usuario lo cerró, espera 7 días antes de volver a aparecer.
 */
export function InstallPrompt() {
    const [mode, setMode] = useState<Mode>('none');
    const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);

    useEffect(() => {
        if (isStandalone()) return;
        if (wasRecentlyDismissed()) return;

        const handler = (e: Event) => {
            e.preventDefault();
            setDeferred(e as BeforeInstallPromptEvent);
            setMode('native');
        };
        window.addEventListener('beforeinstallprompt', handler);

        const installedHandler = () => {
            setMode('none');
            setDeferred(null);
        };
        window.addEventListener('appinstalled', installedHandler);

        // Fallback para iOS: el navegador no soporta beforeinstallprompt,
        // así que enseñamos instrucciones manuales.
        if (isIOS()) {
            setMode('ios-hint');
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
            window.removeEventListener('appinstalled', installedHandler);
        };
    }, []);

    function handleDismiss() {
        localStorage.setItem(DISMISS_KEY, String(Date.now()));
        setMode('none');
    }

    async function handleInstall() {
        if (!deferred) return;
        await deferred.prompt();
        const { outcome } = await deferred.userChoice;
        if (outcome === 'accepted' || outcome === 'dismissed') {
            setDeferred(null);
            setMode('none');
            if (outcome === 'dismissed') handleDismiss();
        }
    }

    if (mode === 'none') return null;

    return (
        <div
            style={{
                position: 'fixed',
                bottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
                left: 'max(12px, calc((100vw - 520px) / 2 + 12px))',
                right: 'max(12px, calc((100vw - 520px) / 2 + 12px))',
                backgroundColor: theme.colors.surface,
                borderRadius: theme.radius.lg,
                border: `1px solid ${theme.colors.border}`,
                boxShadow: '0 12px 28px rgba(26,36,22,0.18)',
                padding: 14,
                zIndex: 50,
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
            }}
        >
            <div
                style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: theme.colors.primaryLight,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexShrink: 0,
                }}
            >
                <Download size={20} color={theme.colors.primaryDark} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
                {mode === 'native' ? (
                    <>
                        <div style={{ fontSize: 14, fontWeight: 700, color: theme.colors.text, marginBottom: 2 }}>
                            Instalar Fevadis
                        </div>
                        <div style={{ fontSize: 12, color: theme.colors.textSecondary, marginBottom: 10, lineHeight: '16px' }}>
                            Ten la app en tu pantalla de inicio y ábrela sin navegador.
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button
                                onClick={handleInstall}
                                style={{
                                    backgroundColor: theme.colors.primary,
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: theme.radius.md,
                                    padding: '8px 14px',
                                    fontSize: 13,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                }}
                            >
                                Instalar
                            </button>
                            <button
                                onClick={handleDismiss}
                                style={{
                                    backgroundColor: 'transparent',
                                    color: theme.colors.textSecondary,
                                    border: 'none',
                                    padding: '8px 10px',
                                    fontSize: 13,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            >
                                Ahora no
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div style={{ fontSize: 14, fontWeight: 700, color: theme.colors.text, marginBottom: 4 }}>
                            Añadir a pantalla de inicio
                        </div>
                        <div style={{ fontSize: 12, color: theme.colors.textSecondary, lineHeight: '18px' }}>
                            Pulsa{' '}
                            <Share size={13} style={{ verticalAlign: 'text-bottom' }} color={theme.colors.primaryDark} />
                            {' '}en Safari y elige{' '}
                            <b>Añadir a pantalla de inicio</b>
                            {' '}
                            <Plus size={13} style={{ verticalAlign: 'text-bottom' }} color={theme.colors.primaryDark} />.
                        </div>
                    </>
                )}
            </div>

            <button
                onClick={handleDismiss}
                aria-label="Cerrar"
                style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 4,
                    color: theme.colors.textTertiary,
                    flexShrink: 0,
                }}
            >
                <X size={16} />
            </button>
        </div>
    );
}
