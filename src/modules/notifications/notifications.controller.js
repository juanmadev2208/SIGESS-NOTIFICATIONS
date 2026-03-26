const notificationsService = require("./notifications.service");
const { sendTemplateSchema, sendCustomSchema } = require("./notifications.schema");

async function sendTemplate(req, res, next) {
  try {
    const payload = sendTemplateSchema.parse(req.body);
    const data = await notificationsService.sendTemplate(payload);
    return res.status(201).json({ ok: true, data });
  } catch (error) {
    if (error && error.name === "ZodError") {
      return res.status(400).json({
        ok: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request body",
          details: error.flatten()
        }
      });
    }
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
          message: "Email service authentication failed"
        }
      });
    }
    if (error.code === "SMTP_CONNECTION_FAILED") {
      return res.status(503).json({
        ok: false,
        error: {
          code: "SMTP_CONNECTION_FAILED",
          message: "Email service unavailable"
        }
      });
    }
    return next(error);
  }
}

async function sendCustom(req, res, next) {
  try {
    const payload = sendCustomSchema.parse(req.body);
    const data = await notificationsService.sendCustom(payload);
    return res.status(201).json({ ok: true, data });
  } catch (error) {
    if (error && error.name === "ZodError") {
      return res.status(400).json({
        ok: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request body",
          details: error.flatten()
        }
      });
    }
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
          message: "Email service authentication failed"
        }
      });
    }
    if (error.code === "SMTP_CONNECTION_FAILED") {
      return res.status(503).json({
        ok: false,
        error: {
          code: "SMTP_CONNECTION_FAILED",
          message: "Email service unavailable"
        }
      });
    }
    return next(error);
  }
}

module.exports = {
  sendTemplate,
  sendCustom
};
