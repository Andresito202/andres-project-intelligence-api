export type Env = {
  DB: D1Database;
  ADMIN_API_KEY?: string;
  ALLOWED_ORIGINS?: string;
  APP_ENV?: string;
  APP_VERSION?: string;
  TURNSTILE_DISABLED?: string;
  TURNSTILE_EXPECTED_ACTION?: string;
  TURNSTILE_EXPECTED_HOSTNAME?: string;
  TURNSTILE_SECRET_KEY?: string;
};

export type AppVariables = {
  requestId: string;
};

export type AppBindings = {
  Bindings: Env;
  Variables: AppVariables;
};

export type RepoVisibility = "public" | "private" | "unpublished";

export type ProjectStatus =
  | "production"
  | "published"
  | "prototype"
  | "in_development"
  | "archived";
