# Andres Project Intelligence API

Professional backend for `andrescamacho.dev`. It exposes portfolio projects, skills, case studies, repository visibility, and contact messages through a versioned API.

The API is built to show real backend engineering in the portfolio: clean architecture, validation, database migrations, OpenAPI documentation, admin security, and CI checks.

## Live API

```txt
https://api.andrescamacho.dev
```

Interactive documentation:

```txt
https://api.andrescamacho.dev/v1/docs
```

OpenAPI specification:

```txt
https://api.andrescamacho.dev/v1/openapi.json
```

## What This API Provides

- A professional backend layer for the portfolio instead of hardcoded frontend-only project data.
- Public endpoints for projects, skills, case studies, and repository visibility.
- Safe handling for private or unpublished repositories by returning `repoUrl: null` instead of links that become 404 pages.
- A contact endpoint prepared for structured message capture, validation, and abuse control.
- Admin-only endpoints protected by `x-api-key` for future internal content operations.
- OpenAPI and Swagger documentation so the API can be reviewed, tested, and integrated like a production service.

## Professional Value

This project demonstrates how a portfolio can move beyond a static website and become a real product surface:

- Content is served from a structured database.
- Public data and private operational data are separated.
- Inputs are validated before reaching the business layer.
- Responses follow a consistent success/error contract.
- Documentation is generated and exposed for external review.
- Deployment is serverless, low-cost, and easy to scale.

## Stack

- Cloudflare Workers
- Cloudflare D1
- Hono
- TypeScript
- Drizzle ORM
- Zod
- Vitest
- GitHub Actions

## Architecture

```txt
src/
  app.ts
  index.ts
  config/
  db/
    schema.ts
    migrations/
    seed.sql
  docs/
    openapi.ts
  lib/
  middleware/
  modules/
    projects/
    skills/
    case-studies/
    repo-status/
    contact/
    health/
```

## Key Architecture Decisions

- `src/app.ts` wires routing, middleware, documentation, and module composition.
- `src/modules/*` keeps each domain isolated: projects, skills, case studies, repo status, contact, health, and admin operations.
- `src/db/schema.ts` defines the relational model used by Drizzle ORM.
- `src/db/migrations` keeps the database reproducible across local and remote environments.
- `src/docs/openapi.ts` publishes a documented contract for consumers.
- `src/middleware` centralizes CORS, request IDs, error handling, admin authentication, and rate limiting.

## Public Endpoints

Production base URL:

```txt
https://api.andrescamacho.dev
```

```txt
GET  /v1/health
GET  /v1/projects
GET  /v1/projects/:slug
GET  /v1/skills
GET  /v1/case-studies
GET  /v1/case-studies/:slug
GET  /v1/repo-status
GET  /v1/repo-status/:projectSlug
POST /v1/contact
GET  /v1/openapi.json
GET  /v1/docs
```

## Security and Data Protection

- Admin routes require the `x-api-key` header.
- Private project repositories should remain `repo_url = null`.
- CORS is configured for controlled frontend consumption.
- Contact payloads are validated with Zod before persistence.
- Contact messages require server-side Cloudflare Turnstile verification before persistence.
- The contact endpoint rejects unapproved production origins, honeypot submissions, and repeated automated submissions.
- Email delivery is handled server-side through an optional `WEB3FORMS_ACCESS_KEY` secret, so the frontend never exposes a form delivery key.
- Secrets are stored through Cloudflare Wrangler, not committed to the repository.

## Admin Endpoints

Protected with the `x-api-key` header.

```txt
POST   /v1/admin/projects
PATCH  /v1/admin/projects/:id
DELETE /v1/admin/projects/:id
GET    /v1/admin/messages
PATCH  /v1/admin/messages/:id/status
```

## Response Format

Success:

```json
{
  "success": true,
  "data": {},
  "meta": {
    "requestId": "req-id",
    "version": "1.0.0"
  }
}
```

Error:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid payload"
  },
  "meta": {
    "requestId": "req-id",
    "version": "1.0.0"
  }
}
```

## Local Setup

```bash
npm install
cp .env.example .dev.vars
npm run db:migrate:local
npm run db:seed:local
npm run dev
```

Production Turnstile setup:

```bash
wrangler secret put TURNSTILE_SECRET_KEY
```

Optional production email delivery:

```bash
wrangler secret put WEB3FORMS_ACCESS_KEY
```

Use a real Cloudflare Turnstile secret in production. Local development can bypass Turnstile only when `APP_ENV` is not `production` and `TURNSTILE_DISABLED=true`.

Then open:

```txt
http://localhost:8787/v1/health
http://localhost:8787/v1/projects
http://localhost:8787/v1/openapi.json
http://localhost:8787/v1/docs
```

## Cloudflare Setup

Create a D1 database:

```bash
npx wrangler d1 create portfolio_api
```

Copy the generated `database_id` into `wrangler.toml`.

Set the admin secret:

```bash
npx wrangler secret put ADMIN_API_KEY
```

Apply migrations and seed data:

```bash
npm run db:migrate:remote
npm run db:seed:remote
```

Deploy:

```bash
npm run deploy
```

## Portfolio Integration

The portfolio should consume:

```txt
GET https://api.andrescamacho.dev/v1/projects
GET https://api.andrescamacho.dev/v1/repo-status
POST https://api.andrescamacho.dev/v1/contact
```

Keep `repo_url = null` for private or unpublished repositories. Public visitors cannot access private GitHub repositories, so exposing those URLs creates 404 or authorization errors.

See [docs/portfolio-integration.md](docs/portfolio-integration.md) and [examples/portfolio-client.ts](examples/portfolio-client.ts) for a typed frontend client.

## Example Portfolio Client Flow

```ts
const response = await fetch('https://api.andrescamacho.dev/v1/projects');
const payload = await response.json();

if (!payload.success) {
  throw new Error(payload.error.message);
}

const projects = payload.data.items;
```

The frontend should treat `repoUrl: null` as a deliberate visibility rule, not as a missing field.

## Quality

```bash
npm run lint
npm run typecheck
npm run test
npm run check
```

## Status

- Production API: active
- Custom domain: active at `api.andrescamacho.dev`
- Documentation: active at `/v1/docs`
- Project catalog: 9 seeded projects, including this API as a backend portfolio project
- Database: Cloudflare D1
- Deployment target: Cloudflare Workers, exposed through a Vercel domain proxy
