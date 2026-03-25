const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const notificationsRoutes = require("./modules/notifications/notifications.routes");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(morgan("combined"));

app.get("/health", (_req, res) => {
  return res.status(200).json({ ok: true, data: { status: "UP" } });
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
