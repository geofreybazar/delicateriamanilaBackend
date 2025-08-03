import { z } from "zod";

export const addCollectionSchema = z.object({
  name: z.string().min(1, "Collection name is required"),
  description: z.string().min(1, "Collection description is required"),
});
export type AddCollectionType = z.infer<typeof addCollectionSchema>;

export const deleteCollectionSchema = z.array(
  z.string().regex(/^[a-f\d]{24}$/i, "Invalid collection ID")
);

export type DeleteCollectionType = z.infer<typeof deleteCollectionSchema>;

export const getCollectionSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid collection ID");

export type GetCollectionType = z.infer<typeof getCollectionSchema>;
