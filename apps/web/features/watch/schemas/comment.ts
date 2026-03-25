import { z } from "zod";

export const commentSchema = z.object({
  text: z.string().min(1),
  spoiler: z.boolean(),
});

export type CommentForm = z.infer<typeof commentSchema>;
