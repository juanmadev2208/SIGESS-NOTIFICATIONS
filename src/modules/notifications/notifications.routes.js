const express = require("express");
const controller = require("./notifications.controller");
const notificationsService = require("./notifications.service");
const { env } = require("../../config/env");

const router = express.Router();

function isAuthorized(req) {
  const apiKey = req.header("x-api-key");
  const authHeader = req.header("authorization") || "";
  const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  const apiKeyOk = env.NOTIFICATIONS_API_KEY && apiKey === env.NOTIFICATIONS_API_KEY;
  const bearerOk = env.NOTIFICATIONS_BEARER_TOKEN && bearer === env.NOTIFICATIONS_BEARER_TOKEN;
  return Boolean(apiKeyOk || bearerOk);
}

function authMiddleware(req, res, next) {
  if (isAuthorized(req)) return next();

  return res.status(401).json({
    ok: false,
    error: {
      code: "UNAUTHORIZED",
      message: "Missing or invalid credentials. Provide x-api-key or Authorization Bearer token.",
      details: {
        route: req.originalUrl,
        method: req.method,
        acceptedAuth: ["x-api-key: <NOTIFICATIONS_API_KEY>", "Authorization: Bearer <NOTIFICATIONS_BEARER_TOKEN>"],
        note: "At least one valid credential is required"
      }
    }
  });
}

// Test route (NO auth required) - for diagnostics - MUST BE BEFORE authMiddleware
router.post("/test/email", async (req, res, next) => {
  try {
    const { to } = req.body;
    if (!to) {
      return res.status(400).json({
        ok: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Missing 'to' field",
          example: { to: "test@example.com" }
        }
      });
    }

    console.log(`[test-email] Sending test email to ${to}`);

    const emailPayload = {
      to,
      subject: "[TEST] SIGESS Notifications - Connection Test",
      html: `
        <div style="font-family: Arial; padding: 20px; background-color: #f5f5f5;">
          <h2 style="color: #2c3e50;">🧪 Prueba de Correo - SIGESS Notifications</h2>
          <p>Este es un correo de prueba para diagnosticar la conexión entre:</p>
          <ul>
            <li><strong>Backend SIGESS:</strong> Envía solicitud HTTP a microservicio</li>
            <li><strong>Microservicio:</strong> Conecta a Gmail SMTP</li>
            <li><strong>Gmail:</strong> Entrega el correo</li>
          </ul>
          <hr />
          <p><strong>Información de la prueba:</strong></p>
          <ul>
            <li>Timestamp: ${new Date().toISOString()}</li>
            <li>Desde: ${env.EMAIL_FROM || 'N/A'}</li>
            <li>Para: ${to}</li>
            <li>Ambiente: ${env.NODE_ENV || 'unknown'}</li>
          </ul>
          <hr />
          <p style="color: #27ae60; font-weight: bold;">✅ Si recibiste este correo, la conexión funciona correctamente.</p>
          <p><small>Este correo fue enviado por el microservicio de notificaciones SIGESS.</small></p>
        </div>
      `,
      templateKey: "TEST_EMAIL"
    };

    const result = await notificationsService.sendCustom(emailPayload);
    return res.status(201).json({ ok: true, data: result });
  } catch (error) {
    // Handle provider errors with proper status codes
    if (error.code === "SMTP_TIMEOUT") {
      return res.status(504).json({
        ok: false,
        error: {
          code: "SMTP_TIMEOUT",
          message: "Email service timeout - please retry"
        }
      });
    }
    if (error.code === "SMTP_AUTH_FAILED") {
      return res.status(500).json({
        ok: false,
        error: {
          code: "SMTP_AUTH_FAILED",
          message: "Email service authentication failed - check Gmail password"
        }
      });
    }
    if (error.code === "SMTP_CONNECTION_FAILED") {
      return res.status(503).json({
        ok: false,
        error: {
          code: "SMTP_CONNECTION_FAILED",
          message: "Email service unavailable - Railway/Gmail connection issue"
        }
      });
    }
    return next(error);
  }
});

// All routes below require authentication
router.use(authMiddleware);
router.post("/email/template", controller.sendTemplate);
router.post("/email/custom", controller.sendCustom);

module.exports = router;
