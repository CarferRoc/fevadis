# send-push Edge Function

Recibe eventos desde los triggers Postgres (`messages`, `activities`,
`documents`) y envía la notificación a los tokens FCM objetivo.

## Deploy

```bash
supabase functions deploy send-push --no-verify-jwt
```

`--no-verify-jwt` porque protegemos la función con un secret propio
(`x-service-secret`), no con el JWT de Supabase Auth.

## Secrets requeridos

```bash
supabase secrets set SB_URL="https://<project>.supabase.co"
supabase secrets set SB_SERVICE_ROLE="<service_role_key>"
supabase secrets set SERVICE_SECRET="<el-mismo-valor-que-app.settings.edge_service_secret>"
supabase secrets set FIREBASE_SERVICE_ACCOUNT="$(cat ~/Downloads/fevadis-xxxxx.json | tr -d '\n')"
```

- `SB_URL` y `SB_SERVICE_ROLE`: para que la función lea `push_tokens`
  bypaseando RLS.
- `SERVICE_SECRET`: el MISMO valor que pusiste en
  `ALTER DATABASE postgres SET app.settings.edge_service_secret = '...'`
  al aplicar la migración 014.
- `FIREBASE_SERVICE_ACCOUNT`: el JSON del service account de Firebase
  (Settings → Service accounts → Generate new private key) convertido a
  una sola línea.

## Test manual

```bash
curl -X POST "https://<project>.supabase.co/functions/v1/send-push" \
  -H "Content-Type: application/json" \
  -H "x-service-secret: <SERVICE_SECRET>" \
  -d '{"type":"activity","activity_id":"xxx","titulo":"Prueba","created_by":null}'
```
