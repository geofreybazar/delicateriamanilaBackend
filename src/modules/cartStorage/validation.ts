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

export const CreateClientUserCartSchema = z.object({
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Client User id"),
  productId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Product id"),
});

export type CreateClientUserCartType = z.infer<
  typeof CreateClientUserCartSchema
>;

export const getCartSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid Client User id or cart id");

export type GetCartType = z.infer<typeof getCartSchema>;
