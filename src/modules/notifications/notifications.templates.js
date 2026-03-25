const sanitizeHtml = require("sanitize-html");
const { env } = require("../../config/env");
const { TEMPLATE_KEYS } = require("./notifications.constants");

function sanitizeText(value) {
  return sanitizeHtml(String(value || ""), { allowedTags: [], allowedAttributes: {} }).trim();
}

function layout({ title, bodyHtml }) {
  const safeTitle = sanitizeText(title);
  const logoBlock = env.EMAIL_LOGO_URL
    ? `<img src="${sanitizeText(env.EMAIL_LOGO_URL)}" alt="logo" style="max-height:48px;margin-bottom:16px;" />`
    : "";

  return `
    <div style="font-family: Arial, sans-serif; line-height:1.5; background:#f6f8fb; padding:24px;">
      <div style="max-width:640px; margin:0 auto; background:#ffffff; border-radius:10px; padding:24px; border:1px solid #e6e9ef;">
        ${logoBlock}
        <h1 style="font-size:20px; margin:0 0 12px; color:#1d2738;">${safeTitle}</h1>
        <div style="font-size:14px; color:#364154;">${bodyHtml}</div>
        <hr style="border:none; border-top:1px solid #e6e9ef; margin:20px 0;" />
        <p style="font-size:12px; color:#6b7280; margin:0;">Soporte: ${sanitizeText(env.EMAIL_SUPPORT)}</p>
      </div>
    </div>
  `;
}

function buildTemplateContent(templateKey, variables = {}) {
  const fullName = sanitizeText(variables.fullName || "Usuario");
  const companyName = sanitizeText(variables.companyName || "Empresa");
  const status = sanitizeText(variables.status || "actualizado");
  const code = sanitizeText(variables.code || "000000");
  const amount = sanitizeText(variables.amount || "");

  switch (templateKey) {
    case TEMPLATE_KEYS.WELCOME_PERSON:
      return {
        subject: `Bienvenido/a ${fullName}`,
        html: layout({
          title: "Bienvenido a SIGESS",
          bodyHtml: `<p>Hola ${fullName}, tu registro fue creado exitosamente.</p>`
        })
      };
    case TEMPLATE_KEYS.WELCOME_COMPANY:
      return {
        subject: `Bienvenida empresa ${companyName}`,
        html: layout({
          title: "Registro de empresa completado",
          bodyHtml: `<p>La empresa ${companyName} ya esta activa en SIGESS.</p>`
        })
      };
    case TEMPLATE_KEYS.AFFILIATION_CREATED:
      return {
        subject: "Afiliacion creada",
        html: layout({
          title: "Nueva afiliacion",
          bodyHtml: "<p>La afiliacion fue creada correctamente.</p>"
        })
      };
    case TEMPLATE_KEYS.AFFILIATION_STATUS_UPDATED:
      return {
        subject: "Estado de afiliacion actualizado",
        html: layout({
          title: "Cambio en afiliacion",
          bodyHtml: `<p>El estado de tu afiliacion ahora es: <strong>${status}</strong>.</p>`
        })
      };
    case TEMPLATE_KEYS.PAYMENT_REMINDER:
      return {
        subject: "Recordatorio de pago",
        html: layout({
          title: "Tienes un pago pendiente",
          bodyHtml: `<p>Te recordamos completar tu pago pendiente ${amount ? `por ${amount}` : ""}.</p>`
        })
      };
    case TEMPLATE_KEYS.PAYMENT_CONFIRMED:
      return {
        subject: "Pago confirmado",
        html: layout({
          title: "Pago recibido",
          bodyHtml: "<p>Tu pago fue confirmado exitosamente.</p>"
        })
      };
    case TEMPLATE_KEYS.PAYMENT_DETAIL:
      return {
        subject: "Detalle de pago",
        html: layout({
          title: "Detalle de tu pago",
          bodyHtml: `<p>Detalle registrado ${amount ? `por ${amount}` : ""}.</p>`
        })
      };
    case TEMPLATE_KEYS.CHAT_VERIFICATION_CODE:
      return {
        subject: "Codigo de verificacion",
        html: layout({
          title: "Verifica tu acceso",
          bodyHtml: `<p>Tu codigo de verificacion es: <strong style="font-size:18px;">${code}</strong></p>`
        })
      };
    case TEMPLATE_KEYS.GENERIC_ADMIN_MESSAGE:
      return {
        subject: "Mensaje administrativo",
        html: layout({
          title: "Comunicado",
          bodyHtml: `<p>${sanitizeText(variables.message || "Tienes un nuevo mensaje administrativo.")}</p>`
        })
      };
    default:
      return {
        subject: "Notificacion SIGESS",
        html: layout({
          title: "Notificacion",
          bodyHtml: "<p>Has recibido una notificacion.</p>"
        })
      };
  }
}

module.exports = {
  buildTemplateContent
};
