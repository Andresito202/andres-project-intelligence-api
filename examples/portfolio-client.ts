const API_URL =
  import.meta.env.VITE_PORTFOLIO_API_URL ??
  "https://andres-project-intelligence-api.wilsonandrescamachoculma.workers.dev";

type ApiResponse<T> =
  | {
      success: true;
      data: T;
      meta: {
        requestId: string;
        version: string;
        count?: number;
      };
    }
  | {
      success: false;
      data: null;
      error: {
        code: string;
        message: string;
        details?: unknown;
      };
      meta: {
        requestId: string;
        version: string;
      };
    };

export type PortfolioProject = {
  id: string;
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  role: string;
  type: string;
  status: string;
  featured: boolean;
  year: number;
  demoUrl: string | null;
  repoUrl: string | null;
  repoVisibility: "public" | "private" | "unpublished";
  category: string;
  stack: string[];
  features: string[];
  screenshots: string[];
};

async function readApi<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, init);
  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !payload.success) {
    throw new Error(payload.success ? `Request failed with status ${response.status}` : payload.error.message);
  }

  return payload.data;
}

export function getPortfolioProjects() {
  return readApi<PortfolioProject[]>("/v1/projects?limit=20");
}

export function getPortfolioProject(slug: string) {
  return readApi<PortfolioProject>(`/v1/projects/${encodeURIComponent(slug)}`);
}

export function sendContactMessage(input: {
  name: string;
  email: string;
  company?: string;
  message: string;
}) {
  return readApi<{ id: string; status: string; receivedAt: string }>("/v1/contact", {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      ...input,
      source: "portfolio"
    })
  });
}
