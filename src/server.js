const app = require("./app");
const { env } = require("./config/env");

// Startup validation
const missing = [];
if (!env.SMTP_USER) missing.push("SMTP_USER|EMAIL_USER");
if (!env.SMTP_PASS) missing.push("SMTP_PASS|EMAIL_PASS");
if (!env.EMAIL_FROM) missing.push("EMAIL_FROM");
if (!env.SMTP_SERVICE && !env.SMTP_HOST) missing.push("SMTP_HOST|SMTP_SERVICE");
if (missing.length > 0) {
  console.error(`[notifications-ms] ✗ Missing critical vars: ${missing.join(", ")}`);
  process.exit(1);
}

const HOST = "0.0.0.0";
const PORT = env.PORT;

const server = app.listen(PORT, HOST, () => {
  console.log(`[notifications-ms] ✓ listening on ${HOST}:${PORT} (${env.NODE_ENV})`);
  if (env.SMTP_SERVICE) {
    console.log(`[notifications-ms] ✓ SMTP service: ${env.SMTP_SERVICE}`);
  } else {
    console.log(`[notifications-ms] ✓ SMTP: ${env.SMTP_HOST}:${env.SMTP_PORT} (secure=${env.SMTP_SECURE})`);
  }
  console.log(`[notifications-ms] ✓ Email from: ${env.EMAIL_FROM}`);
});

server.on("error", (err) => {
  console.error(`[notifications-ms] ✗ server error: ${err.message}`);
  process.exit(1);
});
