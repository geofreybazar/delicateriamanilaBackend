import { z } from "zod";

export const CreateCartServiceSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ProductId");

export type CreateCartServiceType = z.infer<typeof CreateCartServiceSchema>;

export const AddItemServiceSchema = z.object({
  cartId: z.string().min(1, "Cart id is required"),
  productId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ProductId"),
});

export type AddItemServiceType = z.infer<typeof AddItemServiceSchema>;
