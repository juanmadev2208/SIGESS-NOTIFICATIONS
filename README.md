# SIGESS Notifications Microservice

Microservicio HTTP para envio de correos, compatible con el backend principal SIGESS.

## Caracteristicas

- API para envio por template y envio custom HTML.
- Soporte de attachments en base64.
- Respuesta estable: `ok`, `provider`, `providerMessageId`, `status`.
- Envio SMTP con Nodemailer (compatible con Railway).
- Seguridad por `x-api-key` o `Authorization: Bearer`.

## Estructura

- `src/server.js`
- `src/app.js`
- `src/config/env.js`
- `src/modules/notifications/notifications.routes.js`
- `src/modules/notifications/notifications.controller.js`
- `src/modules/notifications/notifications.schema.js`
- `src/modules/notifications/notifications.constants.js`
- `src/modules/notifications/notifications.templates.js`
- `src/modules/notifications/providers/email.provider.js`
- `src/modules/notifications/providers/nodemailer.provider.js`
- `src/modules/notifications/providers/devlog.provider.js`
- `src/modules/notifications/providers/provider.factory.js`
- `src/modules/notifications/notifications.service.js`

## Variables de entorno

Copiar `.env.example` como `.env`.

- `PORT`
- `NODE_ENV`
- `NOTIFICATIONS_API_KEY`
- `NOTIFICATIONS_BEARER_TOKEN`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `EMAIL_FROM`
- `EMAIL_SUPPORT`
- `EMAIL_LOGO_URL`
- `FRONTEND_URL`

## Ejecutar local

```bash
npm install
npm run dev
```

Healthcheck:

```bash
curl http://localhost:3000/health
```

## Endpoints

### POST /v1/notifications/email/template

Headers:

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

### POST /v1/notifications/email/custom

Headers iguales.

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

### Respuesta de exito

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

### Respuesta de error

```json
{
  "ok": false,
  "error": {
    "code": "EMAIL_PROVIDER_ERROR",
    "message": "detalle"
  }
}
```

## Integracion con backend principal SIGESS

En el backend principal, define estas variables:

```dotenv
NOTIFICATIONS_MS_BASE_URL=https://tu-microservicio.com
NOTIFICATIONS_MS_API_KEY=tu_api_key_interna
NOTIFICATIONS_MS_BEARER_TOKEN=
NOTIFICATIONS_MS_TIMEOUT_MS=8000
NOTIFICATIONS_MS_ENABLED=true
NOTIFICATIONS_MS_FAIL_STRICT=false
```

La logica del backend principal se mantiene igual:

- Sigue renderizando templates internos.
- Sigue enviando `subject` + `html` al endpoint `/v1/notifications/email/custom`.
- Solo cambia el destino de envio (este microservicio SMTP).

Autenticacion entre servicios:

- Usa `x-api-key` o `Authorization: Bearer`.
- Recomendado: `x-api-key`.
- Debe coincidir: microservicio `NOTIFICATIONS_API_KEY` y principal `NOTIFICATIONS_MS_API_KEY`.

Headers que debe enviar el backend principal:

```http
Content-Type: application/json
x-api-key: <NOTIFICATIONS_MS_API_KEY>
```

Recomendacion de compatibilidad visual:

- El backend principal renderiza el HTML final.
- Este microservicio recibe `subject` + `html` por `/email/custom`.
- Asi se mantiene el mismo look and feel sin depender del proveedor.

## Despliegue

### Railway

- Crear servicio desde este repo.
- Configurar variables de entorno.
- Comando de inicio: `npm start`.

### Render

- Crear Web Service con este repo.
- Build command: `npm install`.
- Start command: `npm start`.
- Configurar variables de entorno.

### Vercel

Se recomienda Railway o Render para proceso Node persistente. Si usas Vercel, adapta a funciones serverless.
