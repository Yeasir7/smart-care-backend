import { z } from "zod";

const querySchema = z.object({
  query: z.string().min(1, "Query is required"),
  limit: z.number().optional().default(5),
  sourceType: z.string().optional()
});

export const RagValidation = {
  querySchema,
};
