# Portfolio Integration Guide

Use this API as the portfolio content source after it is deployed to Cloudflare Workers.

## Environment Variable

In the portfolio project, add:

```txt
VITE_PORTFOLIO_API_URL=https://api.andrescamacho.dev
```

For local development:

```txt
VITE_PORTFOLIO_API_URL=http://localhost:8787
```

## Project Fetcher

```ts
const API_URL = import.meta.env.VITE_PORTFOLIO_API_URL ?? "https://api.andrescamacho.dev";

export async function getPortfolioProjects() {
  const response = await fetch(`${API_URL}/v1/projects?limit=20`);

  if (!response.ok) {
    throw new Error(`Project API failed with status ${response.status}`);
  }

  const payload = await response.json();

  if (!payload.success) {
    throw new Error(payload.error?.message ?? "Project API returned an error");
  }

  return payload.data;
}
```

## Repository Safety Rule

Never render a GitHub button when `repoUrl` is `null`.

```tsx
{project.repoUrl ? (
  <a href={project.repoUrl} target="_blank" rel="noreferrer">
    Codigo fuente
  </a>
) : (
  <span>Codigo no publicado</span>
)}
```

This prevents public visitors from being sent to private GitHub repositories that return 404 or authorization errors.

## Contact Form

```ts
export async function sendContactMessage(input: {
  name: string;
  email: string;
  company?: string;
  message: string;
  turnstileToken: string;
}) {
  const response = await fetch(`${API_URL}/v1/contact`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      ...input,
      source: "portfolio"
    })
  });

  const payload = await response.json();

  if (!response.ok || !payload.success) {
    throw new Error(payload.error?.message ?? "Contact API returned an error");
  }

  return payload.data;
}
```
