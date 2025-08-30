import { z } from "zod";

// Address Schema
const AddressSchema = z.object({
  city: z.string().nullable(),
  country: z.string().nullable(),
  line1: z.string().nullable(),
  line2: z.string().nullable(),
  postal_code: z.string().nullable(),
  state: z.string().nullable(),
});

// Billing Schema
const BillingSchema = z.object({
  address: AddressSchema,
  email: z.string().nullable(),
  name: z.string().nullable(),
  phone: z.string().nullable(),
});

// Line Item Schema
const LineItemSchema = z.object({
  amount: z.number(),
  currency: z.string(),
  description: z.string().nullable(),
  images: z.array(z.string()).optional(),
  name: z.string(),
  quantity: z.number(),
});

// Payment Source Schema
const PaymentSourceSchema = z.object({
  id: z.string(),
  type: z.string(),
  brand: z.string().optional(),
  country: z.string().optional(),
  last4: z.string().optional(),
});

// Payment Schema
const PaymentSchema = z.object({
  id: z.string(),
  type: z.literal("payment"),
  attributes: z.object({
    amount: z.number(),
    currency: z.string(),
    status: z.string(),
    fee: z.number().optional(),
    foreign_fee: z.number().optional(),
    net_amount: z.number().optional(),
    tax_amount: z.number().optional(),
    metadata: z.record(z.string()).optional(),
    source: PaymentSourceSchema.optional(),
    billing: BillingSchema.optional(),
  }),
});

// Webhook Schema
export const WebhookEventSchema = z.object({
  data: z.object({
    id: z.string(),
    type: z.literal("event"),
    attributes: z.object({
      type: z.string(), // "checkout_session.payment.paid"
      livemode: z.boolean(),
      data: z.object({
        id: z.string(),
        type: z.string(), // "checkout_session"
        attributes: z.object({
          description: z.string().optional(),
          reference_number: z.string().optional(),
          status: z.string().optional(),
          line_items: z.array(LineItemSchema),
          payments: z.array(PaymentSchema),
        }),
      }),
    }),
  }),
});

export type WebhookEventType = z.infer<typeof WebhookEventSchema>;

export const getPaymentServiceSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid product ID");

export type GetPaymentServiceType = z.infer<typeof getPaymentServiceSchema>;
