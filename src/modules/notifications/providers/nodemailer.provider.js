const nodemailer = require("nodemailer");
const EmailProvider = require("./email.provider");
const { env } = require("../../../config/env");

class NodemailerProvider extends EmailProvider {
  constructor() {
    super("smtp_nodemailer");
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS
      }
    });
  }

  validateConfig() {
    const required = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "EMAIL_FROM"];
    const missing = required.filter((key) => !env[key]);
    if (missing.length) {
      const err = new Error(`Missing SMTP config: ${missing.join(", ")}`);
      err.code = "MISSING_PROVIDER_CONFIG";
      throw err;
    }
  }

  async send(payload) {
    try {
      this.validateConfig();

      const info = await this.transporter.sendMail({
        from: env.EMAIL_FROM,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        attachments: (payload.attachments || []).map((a) => ({
          filename: a.filename,
          content: a.contentBase64,
          encoding: "base64",
          contentType: a.mimeType
        }))
      });

      return {
        provider: this.name,
        providerMessageId: info && info.messageId ? String(info.messageId) : null,
        status: "SENT"
      };
    } catch (error) {
      if (!error.code) error.code = "EMAIL_PROVIDER_ERROR";
      throw error;
    }
  }
}

module.exports = NodemailerProvider;
