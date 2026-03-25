const NodemailerProvider = require("./nodemailer.provider");
const DevLogProvider = require("./devlog.provider");

function createProvider() {
  if (process.env.USE_DEV_LOG_PROVIDER === "true") return new DevLogProvider();
  return new NodemailerProvider();
}

module.exports = { createProvider };
