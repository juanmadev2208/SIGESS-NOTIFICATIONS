const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SIGESS Notifications Microservice API",
      version: "1.0.0",
      description: "Microservicio de notificaciones por email para SIGESS",
      contact: {
        name: "SIGESS Development",
        email: "soporte@sigess.com"
      }
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server"
      },
      {
        url: "https://sigess-notifications-production.up.railway.app",
        description: "Production server (Railway)"
      }
    ],
    components: {
      securitySchemes: {
        apiKey: {
          type: "apiKey",
          in: "header",
          name: "x-api-key",
          description: "API Key for authentication"
        },
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Bearer token for authentication"
        }
      },
      schemas: {
        ErrorResponse: {
          type: "object",
          properties: {
            ok: {
              type: "boolean",
              example: false
            },
            error: {
              type: "object",
              properties: {
                code: {
                  type: "string",
                  example: "VALIDATION_ERROR"
                },
                message: {
                  type: "string",
                  example: "Error description"
                },
                details: {
                  type: "object"
                }
              }
            }
          }
        },
        SuccessResponse: {
          type: "object",
          properties: {
            ok: {
              type: "boolean",
              example: true
            },
            data: {
              type: "object"
            }
          }
        },
        EmailRequest: {
          type: "object",
          required: ["to", "subject", "html"],
          properties: {
            to: {
              type: "string",
              example: "user@example.com",
              description: "Recipient email address"
            },
            subject: {
              type: "string",
              example: "Test Email",
              description: "Email subject"
            },
            html: {
              type: "string",
              example: "<p>Email body in HTML</p>",
              description: "Email body in HTML format"
            },
            templateKey: {
              type: "string",
              description: "Optional template key for logging"
            },
            variables: {
              type: "object",
              description: "Optional template variables"
            },
            meta: {
              type: "object",
              description: "Optional metadata"
            },
            createdBy: {
              type: "string",
              description: "Optional user identifier"
            },
            attachments: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  filename: { type: "string" },
                  contentBase64: { type: "string" },
                  mimeType: { type: "string" }
                }
              },
              description: "Optional attachments"
            }
          }
        }
      }
    },
    paths: {
      "/": {
        get: {
          tags: ["Health"],
          summary: "API Root - Get API Documentation",
          description: "Returns API information and available endpoints",
          responses: {
            "200": {
              description: "API is running",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/SuccessResponse" }
                }
              }
            }
          }
        }
      },
      "/health": {
        get: {
          tags: ["Health"],
          summary: "Health Check",
          description: "Check if the service is running and healthy",
          responses: {
            "200": {
              description: "Service is healthy",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/SuccessResponse" }
                }
              }
            }
          }
        }
      },
      "/v1/notifications/email/custom": {
        post: {
          tags: ["Notifications"],
          summary: "Send Custom Email",
          description: "Send a custom email with HTML content",
          security: [{ apiKey: [] }, { bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/EmailRequest" }
              }
            }
          },
          responses: {
            "201": {
              description: "Email sent successfully",
              content: {
                "application/json": {
                  schema: {
                    allOf: [
                      { $ref: "#/components/schemas/SuccessResponse" },
                      {
                        type: "object",
                        properties: {
                          data: {
                            type: "object",
                            properties: {
                              provider: { type: "string", example: "smtp_nodemailer" },
                              providerMessageId: { type: "string" },
                              status: { type: "string", example: "SENT" }
                            }
                          }
                        }
                      }
                    ]
                  }
                }
              }
            },
            "400": {
              description: "Validation error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            },
            "401": {
              description: "Unauthorized - Missing or invalid credentials",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            },
            "503": {
              description: "SMTP Connection Failed",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            },
            "504": {
              description: "SMTP Timeout",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            }
          }
        }
      },
      "/v1/notifications/test/email": {
        post: {
          tags: ["Testing"],
          summary: "Send Test Email (No Auth Required)",
          description: "Send a test email to verify SMTP connectivity. No authentication required.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["to"],
                  properties: {
                    to: {
                      type: "string",
                      example: "test@gmail.com",
                      description: "Recipient email address"
                    }
                  }
                }
              }
            }
          },
          responses: {
            "201": {
              description: "Test email sent successfully",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/SuccessResponse" }
                }
              }
            },
            "400": {
              description: "Missing 'to' field",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            },
            "503": {
              description: "SMTP Connection Failed - Railway/Gmail issue",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            },
            "504": {
              description: "SMTP Timeout - request took too long",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            }
          }
        }
      }
    }
  },
  apis: []
};

const specs = swaggerJsdoc(options);

module.exports = { specs, swaggerUi };
