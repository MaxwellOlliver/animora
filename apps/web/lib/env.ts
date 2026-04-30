import { z } from "zod/v4";

export const env = z
  .object({
    NEXT_PUBLIC_API_URL: z.url(),
    NEXT_PUBLIC_S3_ENDPOINT: z.url(),
    NEXT_PUBLIC_SIGNUP_ENABLED: z.enum(["true", "false"]).default("true"),
  })
  .parse({
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_S3_ENDPOINT: process.env.NEXT_PUBLIC_S3_ENDPOINT,
    NEXT_PUBLIC_SIGNUP_ENABLED: process.env.NEXT_PUBLIC_SIGNUP_ENABLED,
  });
