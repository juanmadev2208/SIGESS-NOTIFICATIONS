const { z } = require("zod");
const { TEMPLATE_KEYS } = require("./notifications.constants");

const attachmentSchema = z.object({
  filename: z.string().min(1).max(255),
  mimeType: z.string().min(3).max(255),
  size: z.number().int().nonnegative().max(25 * 1024 * 1024),
  contentBase64: z.string().min(1)
});

const baseSchema = {
  to: z.string().email(),
  meta: z.record(z.any()).optional(),
  createdBy: z.string().max(255).optional(),
  attachments: z.array(attachmentSchema).optional().default([])
};

const sendTemplateSchema = z.object({
  ...baseSchema,
  templateKey: z.nativeEnum(TEMPLATE_KEYS),
  variables: z.record(z.any()).optional().default({})
});

const sendCustomSchema = z.object({
  ...baseSchema,
  subject: z.string().min(1).max(200),
  html: z.string().min(1).max(2_000_000),
  templateKey: z.nativeEnum(TEMPLATE_KEYS).optional(),
  variables: z.record(z.any()).optional().default({})
});

module.exports = {
  sendTemplateSchema,
  sendCustomSchema
};
