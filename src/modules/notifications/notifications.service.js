const sanitizeHtml = require("sanitize-html");
const { SENT_STATUS } = require("./notifications.constants");
const { buildTemplateContent } = require("./notifications.templates");
const { createProvider } = require("./providers/provider.factory");

function sanitizeText(value) {
  return sanitizeHtml(String(value || ""), { allowedTags: [], allowedAttributes: {} }).trim();
}

function sanitizeIncomingHtml(html) {
  return sanitizeHtml(String(html || ""), {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "table", "tbody", "thead", "tr", "td", "th"]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt", "width", "height", "style"],
      "*": ["style", "class"]
    },
    allowedSchemes: ["http", "https", "data", "mailto"]
  });
}

class NotificationsService {
  constructor() {
    this.provider = createProvider();
  }

  async sendTemplate(payload) {
    const { subject, html } = buildTemplateContent(payload.templateKey, payload.variables || {});
    const result = await this.provider.send({
      to: sanitizeText(payload.to),
      subject,
      html,
      templateKey: payload.templateKey,
      variables: payload.variables || {},
      meta: payload.meta || {},
      createdBy: payload.createdBy,
      attachments: payload.attachments || []
    });

    return {
      provider: result.provider,
      providerMessageId: result.providerMessageId,
      status: result.status || SENT_STATUS
    };
  }

  async sendCustom(payload) {
    const result = await this.provider.send({
      to: sanitizeText(payload.to),
      subject: sanitizeText(payload.subject),
      html: sanitizeIncomingHtml(payload.html),
      templateKey: payload.templateKey,
      variables: payload.variables || {},
      meta: payload.meta || {},
      createdBy: payload.createdBy,
      attachments: payload.attachments || []
    });

    return {
      provider: result.provider,
      providerMessageId: result.providerMessageId,
      status: result.status || SENT_STATUS
    };
  }
}

module.exports = new NotificationsService();
