import { z } from "zod/v4";

export const env = z
  .object({
    NEXT_PUBLIC_API_URL: z.url(),
  })
  .parse({
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  });
