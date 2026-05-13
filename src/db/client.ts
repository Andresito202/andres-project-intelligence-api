import { drizzle } from "drizzle-orm/d1";

import * as schema from "./schema";
import type { Env } from "../types";

export function createDb(env: Env) {
  return drizzle(env.DB, { schema });
}

export type Database = ReturnType<typeof createDb>;
