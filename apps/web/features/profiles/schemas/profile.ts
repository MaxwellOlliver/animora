import { z } from "zod/v4";

export const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(30, "Name is too long"),
  avatarId: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.uuid("Please choose an avatar").optional(),
  ),
});

export type ProfileForm = z.infer<typeof profileSchema>;
