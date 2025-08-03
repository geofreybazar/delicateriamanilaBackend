import { z } from "zod";

export const addProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Product description is required"),
  category: z.string().min(1, "Product category is required"),
  price: z.coerce
    .number({
      required_error: "Price is required",
      invalid_type_error: "Price must be a number",
    })
    .positive("Price must be a positive number"),
  featured: z.string(),
  status: z.enum(["Active", "Inactive"], {
    errorMap: () => ({
      message: "Status must be either 'active' or 'inactive'",
    }),
  }),
  stockQuantity: z.coerce
    .number({
      required_error: "Stock quantity is required",
      invalid_type_error: "Stock quantity must be a number",
    })
    .int("Stock quantity must be a whole number")
    .nonnegative("Stock quantity cannot be negative"),
});
export type AddProductType = z.infer<typeof addProductSchema>;

export const deleteProductsSchema = z.array(
  z.string().regex(/^[a-f\d]{24}$/i, "Invalid product ID")
);

export type DeleteProductsType = z.infer<typeof deleteProductsSchema>;

export const getProductSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid product ID");

export type GetProductType = z.infer<typeof getProductSchema>;

export const featuredProductsSchema = z.object({
  page: z.string().min(1, "Page must be at least 1"),
  limit: z.string().min(1, "Limit must be at least 1"),
});

export type FeaturedProductsType = z.infer<typeof featuredProductsSchema>;
