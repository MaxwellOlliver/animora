import "server-only";

import { z } from "zod/v4";

const schema = z.object({
  APP_URL: z.url(),
  SESSION_SECRET: z.string(),
  NODE_ENV: z.enum(["development", "production", "test"]).default(
    "development",
  ),
  API_URL: z.url(),
  NEXT_PUBLIC_S3_ENDPOINT: z.url(),
  GRAFANA_LOKI_URL: z.url().optional(),
});

export function getServerEnv() {
  return schema.parse({
    APP_URL: process.env.APP_URL,
    SESSION_SECRET: process.env.SESSION_SECRET,
    NODE_ENV: process.env.NODE_ENV,
    API_URL: process.env.API_URL,
    NEXT_PUBLIC_S3_ENDPOINT: process.env.NEXT_PUBLIC_S3_ENDPOINT,
    GRAFANA_LOKI_URL: process.env.GRAFANA_LOKI_URL,
  });
}
