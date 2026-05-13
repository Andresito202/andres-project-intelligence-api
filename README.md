# Andres Project Intelligence API

Professional backend for `andrescamacho.dev`. It exposes portfolio projects, skills, case studies, repository visibility, and contact messages through a versioned API.

The API is built to show real backend engineering in the portfolio: clean architecture, validation, database migrations, OpenAPI documentation, admin security, and CI checks.

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

## Quality

```bash
npm run lint
npm run typecheck
npm run test
npm run check
```
