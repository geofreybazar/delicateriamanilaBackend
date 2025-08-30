import { z } from "zod";

export const CheckoutSessionSchema = z.object({
  cartId: z.string().min(1, "Cart Id is required"),
  totalPrice: z.number().min(1, "Total price is required"),
  isFreeDelivery: z.boolean(),
  items: z.array(
    z.object({
      productid: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ProductId"),
      name: z.string().min(1, "Product name is required"),
      quantity: z.number().min(1, "Quantity is required"),
      price: z.number().min(1, "Price is required"),
      imgUrl: z.string().min(1, "Image URl is required"),
    })
  ),
});

export type CheckoutSessionType = z.infer<typeof CheckoutSessionSchema>;

export const CreatePaymongoPaymentRequestSchema = z.object({
  emailAddress: z.string().email("Invalid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  address: z.string().min(1, "Address is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  city: z.string().min(1, "City is required"),
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must be at most 15 digits")
    .regex(/^[0-9]+$/, "Phone number must contain only numbers"),
  shippingFee: z.number(),
  sessionId: z.string().min(1, "Session ID is required"),
  cartId: z.string().min(1, "Cart ID is required"),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, "Product ID is required"),
        name: z.string().min(1, "Product name is required"),
        quantity: z.number().int().positive("Quantity must be greater than 0"),
        price: z.number().nonnegative("Price must be 0 or greater"),
        imgUrl: z.string().url("Invalid image URL"),
        _id: z.string().min(1, "_id is required"),
      })
    )
    .min(1, "At least one item is required"),
});

export type CreatePaymongoPaymentRequestType = z.infer<
  typeof CreatePaymongoPaymentRequestSchema
>;
