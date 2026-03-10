import { z } from "zod/v4";

export const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(30, "Name is too long"),
  avatar: z.string().optional(),
});

export type ProfileForm = z.infer<typeof profileSchema>;
