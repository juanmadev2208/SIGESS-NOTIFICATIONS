# Migracion a Microservicio de Notificaciones

## Objetivo

El backend principal deja de enviar correos directamente y pasa a consumir este microservicio externo por HTTP.

## Compatibilidad visual de templates

Para mantener el mismo diseno HTML que ya existe en backend principal:

1. El backend principal sigue renderizando templates (`notifications.templates.js`).
2. El microservicio recibe `subject` + `html` final y solo transporta el correo.
3. Asi, el look and feel queda igual y no depende del microservicio.

## Archivos cambiados en backend principal

1. `src/modules/notifications-client/notifications.client.js` (nuevo)
2. `src/modules/notifications/notifications.service.js`
3. `src/modules/persons/persons.controller.js`
4. `src/modules/companies/companies.controller.js`
5. `src/modules/affiliations/affiliations.controller.js`
6. `src/modules/notifications/notifications.model.js`
7. `src/config/swagger.js`
8. `package.json`
9. `package-lock.json`

## Variables de entorno nuevas (backend principal)

Agregar en `.env` del backend principal:

```dotenv
NOTIFICATIONS_MS_BASE_URL=https://tu-microservicio.com
NOTIFICATIONS_MS_API_KEY=tu_api_key_interna
NOTIFICATIONS_MS_BEARER_TOKEN=
NOTIFICATIONS_MS_TIMEOUT_MS=8000
NOTIFICATIONS_MS_ENABLED=true
NOTIFICATIONS_MS_FAIL_STRICT=false
```

## Autenticacion entre backend principal y microservicio

El microservicio protege todos los endpoints y valida credenciales en cada request.

Puedes usar uno de estos mecanismos:

1. `x-api-key`
2. `Authorization: Bearer <token>`

Regla practica recomendada:

- Configurar `NOTIFICATIONS_API_KEY` en el microservicio.
- Configurar el mismo valor en `NOTIFICATIONS_MS_API_KEY` del backend principal.
- Enviar header `x-api-key` desde el backend principal.

Tambien puedes usar bearer token si prefieres, con el mismo esquema de valor compartido.

Si no envias credenciales correctas, el microservicio responde:

```json
{
  "ok": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Missing or invalid credentials"
  }
}
```

Notas:

- `NOTIFICATIONS_MS_FAIL_STRICT=false`: no bloquea el flujo principal si falla el microservicio.
- `NOTIFICATIONS_MS_FAIL_STRICT=true`: falla duro y propaga error al flujo principal.

## Como probar localmente (backend principal)

1. Levantar backend principal.
2. Configurar `NOTIFICATIONS_MS_BASE_URL` apuntando a este microservicio.
3. Crear persona/empresa/afiliacion para disparar correos automaticos.
4. Probar endpoints internos:
   - `POST /api/notifications/send-template`
   - `POST /api/notifications/send-custom`
5. Verificar respuesta y registros en coleccion `Notification`.

## Contrato API requerido en microservicio

### Endpoint 1: envio por template

- Metodo: `POST`
- URL: `/v1/notifications/email/template`
- Headers:
  - `Content-Type: application/json`
  - `x-api-key: <api-key>` o `Authorization: Bearer <token>`

Body:

```json
{
  "to": "usuario@correo.com",
  "templateKey": "WELCOME_PERSON",
  "variables": { "fullName": "Juan" },
  "meta": { "module": "persons" },
  "createdBy": "<optional>",
  "attachments": [
    {
      "filename": "archivo.pdf",
      "mimeType": "application/pdf",
      "size": 12345,
      "contentBase64": "JVBERi0x..."
    }
  ]
}
```

### Endpoint 2: envio custom (HTML ya renderizado)

- Metodo: `POST`
- URL: `/v1/notifications/email/custom`
- Headers: iguales al endpoint anterior

Body:

```json
{
  "to": "usuario@correo.com",
  "subject": "Asunto",
  "html": "<h1>...</h1>",
  "templateKey": "GENERIC_ADMIN_MESSAGE",
  "variables": { "foo": "bar" },
  "meta": { "module": "notifications" },
  "createdBy": "<optional>",
  "attachments": []
}
```

Este endpoint es el principal para mantener compatibilidad visual total con el backend actual.

### Respuesta de exito esperada

```json
{
  "ok": true,
  "data": {
    "provider": "smtp_nodemailer",
    "providerMessageId": "abc123",
    "status": "SENT"
  }
}
```

### Respuesta de error esperada

```json
{
  "ok": false,
  "error": {
    "code": "EMAIL_PROVIDER_ERROR",
    "message": "detalle"
  }
}
```

## Estrategia de resiliencia en backend principal

- Si falla microservicio y `NOTIFICATIONS_MS_FAIL_STRICT=false`:
  - No tumbar flujo principal.
  - Loggear error con contexto.
  - Marcar notificacion local como `FAILED` o `SKIPPED` con razon.
- Si `NOTIFICATIONS_MS_FAIL_STRICT=true`:
  - Propagar error y responder fallo segun endpoint.

## Variables en este microservicio (Railway)

Configurar en Railway estas variables:

```dotenv
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=<tu_correo>
SMTP_PASS=<tu_app_password>
EMAIL_FROM=<tu_correo>
EMAIL_SUPPORT=soporte@sigess.com
```

Opcional para seguridad API:

```dotenv
NOTIFICATIONS_API_KEY=<tu_api_key_interna>
NOTIFICATIONS_BEARER_TOKEN=
```

## Mapeo de variables entre repos

Valores que deben coincidir entre repos:

- Microservicio `NOTIFICATIONS_API_KEY` <-> Principal `NOTIFICATIONS_MS_API_KEY`
- Microservicio `NOTIFICATIONS_BEARER_TOKEN` <-> Principal `NOTIFICATIONS_MS_BEARER_TOKEN`

Valores propios del principal:

- `NOTIFICATIONS_MS_BASE_URL`
- `NOTIFICATIONS_MS_TIMEOUT_MS`
- `NOTIFICATIONS_MS_ENABLED`
- `NOTIFICATIONS_MS_FAIL_STRICT`

Valores propios del microservicio:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `EMAIL_FROM`
- `EMAIL_SUPPORT`

## Implementacion sugerida en backend principal (cliente HTTP)

Archivo sugerido: `src/modules/notifications-client/notifications.client.js`

```js
const axios = require("axios");

const baseURL = process.env.NOTIFICATIONS_MS_BASE_URL;
const timeout = Number(process.env.NOTIFICATIONS_MS_TIMEOUT_MS || 8000);

const headers = {
  "Content-Type": "application/json"
};

if (process.env.NOTIFICATIONS_MS_API_KEY) {
  headers["x-api-key"] = process.env.NOTIFICATIONS_MS_API_KEY;
}

if (process.env.NOTIFICATIONS_MS_BEARER_TOKEN) {
  headers.Authorization = `Bearer ${process.env.NOTIFICATIONS_MS_BEARER_TOKEN}`;
}

const client = axios.create({ baseURL, timeout, headers });

async function sendCustomEmail(payload) {
  const { data } = await client.post("/v1/notifications/email/custom", payload);
  return data;
}

async function sendTemplateEmail(payload) {
  const { data } = await client.post("/v1/notifications/email/template", payload);
  return data;
}

module.exports = { sendCustomEmail, sendTemplateEmail };
```

## Flujo recomendado (sin cambiar logica actual)

1. Backend principal renderiza template HTML como hoy.
2. Backend principal llama `/v1/notifications/email/custom` con `to`, `subject`, `html`.
3. Microservicio envia por SMTP (Nodemailer + Gmail/SMTP provider).
4. Backend principal guarda resultado en su modelo `Notification`.

## Checklist de conexion final

1. Railway desplegado con variables SMTP y `NOTIFICATIONS_API_KEY`.
2. Backend principal con `NOTIFICATIONS_MS_BASE_URL` apuntando al dominio Railway.
3. `NOTIFICATIONS_MS_API_KEY` igual a `NOTIFICATIONS_API_KEY` del microservicio.
4. Endpoint de prueba desde principal responde `ok: true`.
5. Correo llega y se registra en logs/modelo de notificaciones.
