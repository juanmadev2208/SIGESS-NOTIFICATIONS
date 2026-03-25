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
    return next(error);
  }
}

module.exports = {
  sendTemplate,
  sendCustom
};
