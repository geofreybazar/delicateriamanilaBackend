import { z } from "zod";

export const OrderItemSchema = z.object({
  name: z.string(),
  quantity: z.number().min(1),
  price: z.number().min(0),
  imgUrl: z.string().url(),
  desciption: z.string().optional(),
});

export const OrderSchemaZ = z.object({
  webhookId: z.string(),
  type: z.string(),
  status: z.boolean(),
  totalAmount: z.number().min(0),
  customerDetails: z.object({
    name: z.string(),
    email: z.string().email(),
    phoneNumber: z.string(),
  }),
  deliveryAddress: z.object({
    line1: z.string().optional(),
    city: z.string(),
    postaCode: z.number(),
    state: z.string(),
  }),
  itemsOrdered: z.array(OrderItemSchema),
});
