const dotenv = require("dotenv");

dotenv.config();

// Validate critical environment variables
const criticalVars = ["SMTP_HOST", "SMTP_USER", "SMTP_PASS", "EMAIL_FROM"];
const missing = criticalVars.filter((v) => !process.env[v]);
if (missing.length > 0) {
  console.error(`[env.js] Missing critical variables during config load: ${missing.join(", ")}`);
}

const env = {
  PORT: Number(process.env.PORT || 3000),
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
