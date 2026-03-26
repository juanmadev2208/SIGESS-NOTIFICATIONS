const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const notificationsRoutes = require("./modules/notifications/notifications.routes");
const { specs, swaggerUi } = require("./swagger");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(morgan("combined"));

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.get("/", (_req, res) => {
  return res.status(200).json({
    ok: true,
    message: "SIGESS Notifications API is running",
    data: {
      service: "sigess-notifications-ms",
      status: "UP",
      timestamp: new Date().toISOString(),
      endpoints: {
        health: "/health",
        notificationsBase: "/v1/notifications",
        sendTemplate: "POST /v1/notifications/email/template",
        sendCustom: "POST /v1/notifications/email/custom"
      },
      auth: {
        required: true,
        methods: ["x-api-key header", "Authorization: Bearer <token>"]
      }
    }
  });
});

app.get("/health", (_req, res) => {
  return res.status(200).json({
    ok: true,
    message: "Health check passed",
    data: {
      service: "sigess-notifications-ms",
      status: "UP",
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString()
    }
  });
});

app.use("/v1/notifications", notificationsRoutes);

app.use((err, _req, res, _next) => {
  const status = err.statusCode || 500;
  const code = err.code || "INTERNAL_ERROR";
  const message = err.message || "Unexpected error";
  const details = err.details || undefined;

  return res.status(status).json({
    ok: false,
    error: {
      code,
      message,
      details
    }
  });
});

module.exports = app;
