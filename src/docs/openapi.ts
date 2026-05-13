export const openApiDocument = {
  openapi: "3.1.0",
  info: {
    title: "Andres Project Intelligence API",
    version: "1.0.0",
    description:
      "Professional API for Andres Camacho portfolio projects, case studies, skills, repository status, and contact messages."
  },
  servers: [
    {
      url: "https://api.andrescamacho.dev",
      description: "Production"
    },
    {
      url: "http://localhost:8787",
      description: "Local development"
    }
  ],
  security: [],
  tags: [
    { name: "Health" },
    { name: "Projects" },
    { name: "Skills" },
    { name: "Case Studies" },
    { name: "Repository Status" },
    { name: "Contact" },
    { name: "Admin" }
  ],
  paths: {
    "/v1/health": {
      get: {
        tags: ["Health"],
        summary: "Check API health",
        responses: {
          "200": { description: "API is healthy" }
        }
      }
    },
    "/v1/projects": {
      get: {
        tags: ["Projects"],
        summary: "List portfolio projects",
        parameters: [
          { name: "featured", in: "query", schema: { type: "boolean" } },
          {
            name: "status",
            in: "query",
            schema: {
              type: "string",
              enum: ["production", "published", "prototype", "in_development", "archived"]
            }
          },
          { name: "category", in: "query", schema: { type: "string" } },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 50 } }
        ],
        responses: {
          "200": { description: "Project list" }
        }
      }
    },
    "/v1/projects/{slug}": {
      get: {
        tags: ["Projects"],
        summary: "Get one project by slug",
        parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Project found" },
          "404": { description: "Project not found" }
        }
      }
    },
    "/v1/skills": {
      get: {
        tags: ["Skills"],
        summary: "List technical skills",
        responses: {
          "200": { description: "Skill list" }
        }
      }
    },
    "/v1/case-studies": {
      get: {
        tags: ["Case Studies"],
        summary: "List case studies",
        responses: {
          "200": { description: "Case study list" }
        }
      }
    },
    "/v1/case-studies/{slug}": {
      get: {
        tags: ["Case Studies"],
        summary: "Get one case study by slug",
        parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Case study found" },
          "404": { description: "Case study not found" }
        }
      }
    },
    "/v1/repo-status": {
      get: {
        tags: ["Repository Status"],
        summary: "List public/private/unpublished repository status for portfolio projects",
        responses: {
          "200": { description: "Repository status list" }
        }
      }
    },
    "/v1/contact": {
      post: {
        tags: ["Contact"],
        summary: "Create a contact message",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateContactMessage" }
            }
          }
        },
        responses: {
          "201": { description: "Message received" },
          "400": { description: "Invalid message" },
          "403": { description: "Origin or captcha verification failed" },
          "502": { description: "Message stored but email notification failed" },
          "429": { description: "Rate limited" }
        }
      }
    },
    "/v1/docs": {
      get: {
        tags: ["Health"],
        summary: "Open Swagger UI documentation",
        responses: {
          "200": { description: "Interactive documentation" }
        }
      }
    },
    "/v1/admin/projects": {
      post: {
        tags: ["Admin"],
        security: [{ AdminApiKey: [] }],
        summary: "Create a project",
        responses: {
          "201": { description: "Project created" },
          "401": { description: "Missing or invalid API key" }
        }
      }
    },
    "/v1/admin/projects/{id}": {
      patch: {
        tags: ["Admin"],
        security: [{ AdminApiKey: [] }],
        summary: "Update a project",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Project updated" }
        }
      },
      delete: {
        tags: ["Admin"],
        security: [{ AdminApiKey: [] }],
        summary: "Delete a project",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Project deleted" }
        }
      }
    },
    "/v1/admin/messages": {
      get: {
        tags: ["Admin"],
        security: [{ AdminApiKey: [] }],
        summary: "List contact messages",
        responses: {
          "200": { description: "Message list" }
        }
      }
    }
  },
  components: {
    securitySchemes: {
      AdminApiKey: {
        type: "apiKey",
        in: "header",
        name: "x-api-key"
      }
    },
    schemas: {
      CreateContactMessage: {
        type: "object",
        required: ["name", "email", "message", "turnstileToken"],
        properties: {
          name: { type: "string", minLength: 2, maxLength: 120 },
          email: { type: "string", format: "email" },
          company: { type: "string", nullable: true },
          message: { type: "string", minLength: 20, maxLength: 3000 },
          source: { type: "string", default: "portfolio" },
          botcheck: {
            type: "string",
            description: "Hidden honeypot field. Must stay empty."
          },
          turnstileToken: {
            type: "string",
            maxLength: 2048,
            description: "Cloudflare Turnstile token generated by the portfolio contact form."
          }
        }
      }
    }
  }
} as const;
