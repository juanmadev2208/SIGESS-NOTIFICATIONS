const dotenv = require("dotenv");

dotenv.config();

function resolvePort() {
  const parsed = Number.parseInt(process.env.PORT, 10);
  if (Number.isInteger(parsed) && parsed > 0 && parsed <= 65535) return parsed;
  return 8080;
}

const env = {
  PORT: resolvePort(),
  NODE_ENV: process.env.NODE_ENV || "development",
  NOTIFICATIONS_API_KEY: process.env.NOTIFICATIONS_API_KEY || "",
  NOTIFICATIONS_BEARER_TOKEN: process.env.NOTIFICATIONS_BEARER_TOKEN || "",
  SMTP_HOST: process.env.SMTP_HOST || "",
  SMTP_PORT: Number(process.env.SMTP_PORT || 465),
  SMTP_SECURE: String(process.env.SMTP_SECURE || "true").toLowerCase() === "true",
  SMTP_USER: process.env.SMTP_USER || "",
  SMTP_PASS: process.env.SMTP_PASS || "",
  EMAIL_FROM: process.env.EMAIL_FROM || "no-reply@example.com",
  EMAIL_SUPPORT: process.env.EMAIL_SUPPORT || "support@example.com",
  EMAIL_LOGO_URL: process.env.EMAIL_LOGO_URL || "",
  FRONTEND_URL: process.env.FRONTEND_URL || ""
};

module.exports = { env };
