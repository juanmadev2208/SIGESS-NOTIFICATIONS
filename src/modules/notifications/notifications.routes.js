const express = require("express");
const controller = require("./notifications.controller");
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

router.use(authMiddleware);
router.post("/email/template", controller.sendTemplate);
router.post("/email/custom", controller.sendCustom);

module.exports = router;
