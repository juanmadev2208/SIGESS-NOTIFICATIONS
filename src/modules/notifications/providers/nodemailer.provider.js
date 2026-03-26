const nodemailer = require("nodemailer");
const EmailProvider = require("./email.provider");
const { env } = require("../../../config/env");

class NodemailerProvider extends EmailProvider {
  constructor() {
    super("smtp_nodemailer");
    const transportBase = {
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS
      },
      // Critical timeouts to prevent hanging
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 10000,
      logger: false,
      debug: false,
      tls: {
        rejectUnauthorized: env.SMTP_TLS_REJECT_UNAUTHORIZED
      }
    };

    const transportConfig = env.SMTP_SERVICE
      ? {
          ...transportBase,
          service: env.SMTP_SERVICE
        }
      : {
          ...transportBase,
          host: env.SMTP_HOST,
          port: env.SMTP_PORT,
          secure: env.SMTP_SECURE
        };

    this.transporter = nodemailer.createTransport(transportConfig);
    if (env.SMTP_VERIFY_ON_STARTUP) {
      this.verifyOnInit();
    } else {
      console.log("[notifications-ms] SMTP verify on startup is disabled");
    }
  }

  async verifyOnInit() {
    try {
      await this.transporter.verify();
      console.log("[notifications-ms] ✓ SMTP connection verified at startup");
    } catch (err) {
      console.error(`[notifications-ms] ✗ SMTP verification failed: ${err.message}`);
      console.error(`[notifications-ms] ✗ Error code: ${err.code}`);
    }
  }

  validateConfig() {
    const required = ["SMTP_USER", "SMTP_PASS", "EMAIL_FROM"];
    const missing = required.filter((key) => !env[key]);
    if (!env.SMTP_SERVICE && !env.SMTP_HOST) {
      missing.push("SMTP_HOST|SMTP_SERVICE");
    }
    if (missing.length) {
      const err = new Error(`Missing SMTP config: ${missing.join(", ")}`);
      err.code = "MISSING_PROVIDER_CONFIG";
      throw err;
    }
  }

  async send(payload) {
    const requestId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const startTime = Date.now();
    
    try {
      this.validateConfig();
      console.log(`[notifications-ms] [${requestId}] ↓ sending email to ${payload.to}`);

      const mailOptions = {
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
      };

      // Hard timeout: 12 seconds for entire sendMail operation
      const info = await Promise.race([
        this.transporter.sendMail(mailOptions),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("SMTP_TIMEOUT: sendMail exceeded 12 seconds")),
            12000
          )
        )
      ]);

      const duration = Date.now() - startTime;
      console.log(`[notifications-ms] [${requestId}] ✓ email sent in ${duration}ms, messageId: ${info.messageId}`);

      return {
        provider: this.name,
        providerMessageId: info && info.messageId ? String(info.messageId) : null,
        status: "SENT"
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[notifications-ms] [${requestId}] ✗ failed in ${duration}ms: ${error.message}`);
      
      if (error.message.includes("SMTP_TIMEOUT")) {
        error.code = "SMTP_TIMEOUT";
      } else if (error.code === "ECONNREFUSED") {
        error.code = "SMTP_CONNECTION_FAILED";
      } else if (error.code === "ETIMEDOUT") {
        error.code = "SMTP_TIMEOUT";
      } else if (error.message.includes("Invalid login")) {
        error.code = "SMTP_AUTH_FAILED";
      } else if (!error.code) {
        error.code = "EMAIL_PROVIDER_ERROR";
      }
      
      throw error;
    }
  }
}

module.exports = NodemailerProvider;
