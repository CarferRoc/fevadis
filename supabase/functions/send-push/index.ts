// @ts-nocheck — este fichero corre en Deno (Edge Functions), no en Node.
// VS Code usa el TS del resto del monorepo para tipar, y se queja de los
// imports remotos y de `Deno.*`. Silenciamos esos falsos errores aquí.
// deno-lint-ignore-file no-explicit-any
// Supabase Edge Function: send-push
//
// Recibe eventos desde los triggers Postgres (fan_out_push) y manda la
// notificación correspondiente a todos los tokens FCM objetivo.
//
// Secrets requeridos:
//   SB_URL                  = https://<project>.supabase.co
//   SB_SERVICE_ROLE         = service_role key de Supabase
//   SERVICE_SECRET          = coincide con app_settings.edge_service_secret
//   FIREBASE_PROJECT_ID     = p.ej. fevadis-e7855
//   FIREBASE_CLIENT_EMAIL   = firebase-adminsdk-xxxx@<project>.iam.gserviceaccount.com
//   FIREBASE_PRIVATE_KEY    = contenido del campo "private_key" del JSON de Firebase
//                             (con \n literales o newlines reales — se normaliza)
//
// NO expongas esta función públicamente sin el header x-service-secret.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { SignJWT, importPKCS8 } from 'https://esm.sh/jose@5.9.6';

const SB_URL = Deno.env.get('SB_URL')!;
const SB_SERVICE_ROLE = Deno.env.get('SB_SERVICE_ROLE')!;
const SERVICE_SECRET = Deno.env.get('SERVICE_SECRET')!;

const FIREBASE_PROJECT_ID = Deno.env.get('FIREBASE_PROJECT_ID')!;
const FIREBASE_CLIENT_EMAIL = Deno.env.get('FIREBASE_CLIENT_EMAIL')!;

// Normaliza la private key. Acepta:
//   · el valor completo del JSON (con `\n` literales o newlines reales)
//   · el JSON entero del service account (extrae el campo private_key)
//   · el body base64 suelto, sin markers PEM
//   · con comillas envolventes
function normalizePrivateKey(raw: string): string {
    let key = raw.trim();

    // Si pegaste el JSON entero, sacamos el campo.
    if (key.startsWith('{')) {
        try {
            const parsed = JSON.parse(key);
            if (typeof parsed.private_key === 'string') key = parsed.private_key;
        } catch {
            /* no era JSON válido, seguimos */
        }
    }

    // Comillas envolventes por error.
    if (
        (key.startsWith('"') && key.endsWith('"')) ||
        (key.startsWith("'") && key.endsWith("'"))
    ) {
        key = key.slice(1, -1);
    }

    // `\n` literales → saltos reales.
    key = key.replace(/\\n/g, '\n').replace(/\\r/g, '');

    // Si no hay markers PEM, asumimos que es el body base64 y los añadimos.
    const hasBegin = key.includes('-----BEGIN PRIVATE KEY-----');
    const hasEnd = key.includes('-----END PRIVATE KEY-----');

    if (!hasBegin || !hasEnd) {
        const body = key.replace(/-----BEGIN [^-]+-----/g, '')
                        .replace(/-----END [^-]+-----/g, '')
                        .replace(/\s+/g, '');
        const chunked = body.match(/.{1,64}/g)?.join('\n') ?? body;
        key = `-----BEGIN PRIVATE KEY-----\n${chunked}\n-----END PRIVATE KEY-----\n`;
    } else if (!key.includes('\n')) {
        // Hay markers pero está todo en una línea: troceamos el body.
        const m = key.match(
            /-----BEGIN PRIVATE KEY-----\s*([A-Za-z0-9+/=\s]+?)\s*-----END PRIVATE KEY-----/
        );
        if (m) {
            const body = m[1].replace(/\s+/g, '');
            const chunked = body.match(/.{1,64}/g)?.join('\n') ?? body;
            key = `-----BEGIN PRIVATE KEY-----\n${chunked}\n-----END PRIVATE KEY-----\n`;
        }
    }
    return key;
}

const FIREBASE_PRIVATE_KEY = normalizePrivateKey(
    Deno.env.get('FIREBASE_PRIVATE_KEY') ?? ''
);

// Diagnóstico inicial (no expone la clave: solo longitud y límites).
console.log(
    '[send-push] private key check: length=%d starts=%s ends=%s hasNewlines=%s',
    FIREBASE_PRIVATE_KEY.length,
    FIREBASE_PRIVATE_KEY.slice(0, 30),
    FIREBASE_PRIVATE_KEY.slice(-30),
    FIREBASE_PRIVATE_KEY.includes('\n')
);

const supabase = createClient(SB_URL, SB_SERVICE_ROLE, {
    auth: { persistSession: false },
});

// ─── OAuth: access_token de Google con el service account ─────
let cachedToken: { token: string; exp: number } | null = null;
async function getAccessToken(): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    if (cachedToken && cachedToken.exp - 60 > now) return cachedToken.token;

    const privateKey = await importPKCS8(FIREBASE_PRIVATE_KEY, 'RS256');
    const jwt = await new SignJWT({
        scope: 'https://www.googleapis.com/auth/firebase.messaging',
    })
        .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
        .setIssuer(FIREBASE_CLIENT_EMAIL)
        .setSubject(FIREBASE_CLIENT_EMAIL)
        .setAudience('https://oauth2.googleapis.com/token')
        .setIssuedAt(now)
        .setExpirationTime(now + 3600)
        .sign(privateKey);

    const resp = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: jwt,
        }),
    });
    if (!resp.ok) throw new Error(`OAuth failed: ${await resp.text()}`);
    const { access_token, expires_in } = await resp.json();
    cachedToken = { token: access_token, exp: now + expires_in };
    return access_token;
}

// ─── Envío FCM HTTP v1 ────────────────────────────────────────
interface Payload {
    title: string;
    body: string;
    url?: string;
    tag?: string;
}

async function sendToTokens(tokens: string[], payload: Payload) {
    if (tokens.length === 0) return;
    const accessToken = await getAccessToken();
    const endpoint = `https://fcm.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/messages:send`;

    await Promise.all(
        tokens.map(async (token) => {
            const body = {
                message: {
                    token,
                    notification: { title: payload.title, body: payload.body },
                    webpush: {
                        fcm_options: payload.url ? { link: payload.url } : undefined,
                        headers: { Urgency: 'high' },
                    },
                    data: {
                        ...(payload.url ? { url: payload.url } : {}),
                        ...(payload.tag ? { tag: payload.tag } : {}),
                    },
                },
            };
            const resp = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });
            if (!resp.ok) {
                const txt = await resp.text();
                console.warn(`FCM send failed for token ${token.slice(0, 12)}…: ${resp.status} ${txt}`);
                // 404 / 410 = token inválido → limpieza
                if (resp.status === 404 || resp.status === 410) {
                    await supabase.from('push_tokens').delete().eq('token', token);
                }
            }
        })
    );
}

async function tokensForUsers(userIds: string[], exclude: string | null) {
    const filtered = userIds.filter((u) => u && u !== exclude);
    if (filtered.length === 0) return [];
    const { data, error } = await supabase
        .from('push_tokens')
        .select('token')
        .in('user_id', filtered);
    if (error) {
        console.error('fetch tokens error', error);
        return [];
    }
    return (data ?? []).map((r: any) => r.token as string);
}

async function tokensForAllUsers(exclude: string | null) {
    let q = supabase.from('push_tokens').select('token, user_id');
    const { data, error } = await q;
    if (error) {
        console.error('fetch all tokens error', error);
        return [];
    }
    return (data ?? [])
        .filter((r: any) => !exclude || r.user_id !== exclude)
        .map((r: any) => r.token as string);
}

// ─── Handler ──────────────────────────────────────────────────
Deno.serve(async (req) => {
    if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }
    if (req.headers.get('x-service-secret') !== SERVICE_SECRET) {
        return new Response('Forbidden', { status: 403 });
    }

    let event: any;
    try {
        event = await req.json();
    } catch {
        return new Response('Invalid JSON', { status: 400 });
    }

    try {
        switch (event.type) {
            case 'message': {
                const participants: string[] = event.participants ?? [];
                const tokens = await tokensForUsers(participants, event.sender_id);
                const title = event.is_group
                    ? `${event.chat_name}`
                    : `${event.sender_name?.trim() || 'Mensaje nuevo'}`;
                const body = event.text ?? '';
                await sendToTokens(tokens, {
                    title,
                    body: body.length > 140 ? body.slice(0, 137) + '…' : body,
                    url: `/chats/${event.chat_id}`,
                    tag: `chat-${event.chat_id}`,
                });
                break;
            }
            case 'activity': {
                const tokens = await tokensForAllUsers(event.created_by ?? null);
                await sendToTokens(tokens, {
                    title: 'Nueva actividad',
                    body: event.titulo ?? '',
                    url: `/activities/${event.activity_id}`,
                    tag: `activity-${event.activity_id}`,
                });
                break;
            }
            case 'info_doc': {
                const tokens = await tokensForAllUsers(event.uploaded_by ?? null);
                await sendToTokens(tokens, {
                    title: 'Nuevo documento',
                    body: `${event.title} · ${event.category ?? ''}`.trim(),
                    url: '/info',
                    tag: `info-${event.document_id}`,
                });
                break;
            }
            default:
                return new Response(`Unknown event type: ${event.type}`, { status: 400 });
        }
        return new Response(JSON.stringify({ ok: true }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err) {
        console.error('send-push error', err);
        return new Response('Internal error', { status: 500 });
    }
});
