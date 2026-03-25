const EmailProvider = require("./email.provider");

class DevLogProvider extends EmailProvider {
  constructor() {
    super("dev_log");
  }

  async send(payload) {
    console.log("[DEV_LOG_PROVIDER] email payload", {
      to: payload.to,
      subject: payload.subject,
      attachmentsCount: (payload.attachments || []).length,
      meta: payload.meta || {}
    });

    return {
      provider: this.name,
      providerMessageId: `dev-${Date.now()}`,
      status: "SENT"
    };
  }
}

module.exports = DevLogProvider;
