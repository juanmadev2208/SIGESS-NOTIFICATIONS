const app = require("./app");
const { env } = require("./config/env");

// Startup validation
const requiredVars = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "EMAIL_FROM"];
const missing = requiredVars.filter((v) => !env[v]);
if (missing.length > 0) {
  console.error(`[notifications-ms] ✗ Missing critical vars: ${missing.join(", ")}`);
  process.exit(1);
}

const HOST = "0.0.0.0";
const PORT = env.PORT;

const server = app.listen(PORT, HOST, () => {
  console.log(`[notifications-ms] ✓ listening on ${HOST}:${PORT} (${env.NODE_ENV})`);
  console.log(`[notifications-ms] ✓ SMTP: ${env.SMTP_HOST}:${env.SMTP_PORT} (secure=${env.SMTP_SECURE})`);
  console.log(`[notifications-ms] ✓ Email from: ${env.EMAIL_FROM}`);
});

server.on("error", (err) => {
  console.error(`[notifications-ms] ✗ server error: ${err.message}`);
  process.exit(1);
});
