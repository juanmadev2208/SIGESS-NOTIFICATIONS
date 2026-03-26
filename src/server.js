const app = require("./app");
const { env } = require("./config/env");

const server = app.listen(env.PORT, "0.0.0.0", () => {
  console.log(`[notifications-ms] ✓ listening on 0.0.0.0:${env.PORT} (${env.NODE_ENV})`);
});

server.on("error", (err) => {
  console.error(`[notifications-ms] ✗ server error: ${err.message}`);
  process.exit(1);
});
