import { z } from "zod";

// Search validation schema
export const searchSchema = z.object({
  query: z
    .string()
    .min(1, "Search query is required")
    .max(100, "Search query must be less than 100 characters"),
});

export type SearchFormData = z.infer<typeof searchSchema>;

// Search field configuration
export const searchFields = [
  {
    name: "query" as const,
    label: "Search",
    placeholder: "Search for anything...",
    type: "text" as const,
  },
] as const;
