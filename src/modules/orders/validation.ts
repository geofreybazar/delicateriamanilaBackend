import { z } from "zod";

export const orderIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid product ID");

export type OrderIdType = z.infer<typeof orderIdSchema>;

export const AssignDeliveryServiceSchema = z.object({
  orderId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid order ID"),
  riderId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid rider ID"),
});

export type AssignDeliveryServiceType = z.infer<
  typeof AssignDeliveryServiceSchema
>;

export const OrderPickedupServiceSchema = z.object({
  orderId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid order ID"),
  trackingNumber: z.string().min(1, "Reference number is required"),
  modeOfPickup: z.string().min(1, "Mode of Pickup is required"),
  pickupPersonName: z.string().min(1, "Pickup Person name is required"),
  validId: z.string().min(1, "Valid id is required"),
  idNumber: z.string().min(1, "Id number is required"),
  contactNumber: z.string().regex(/^(09\d{9}|(\+639)\d{9})$/, {
    message: "Invalid Philippine mobile number",
  }),
  pickupDateAndTime: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date string",
    })
    .transform((val) => new Date(val)),
});

export type OrderPickedupServiceType = z.infer<
  typeof OrderPickedupServiceSchema
>;
