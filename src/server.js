const app = require("./app");
const { env } = require("./config/env");

app.listen(env.PORT, "0.0.0.0", () => {
  console.log(`[notifications-ms] running on port ${env.PORT} (${env.NODE_ENV})`);
});
