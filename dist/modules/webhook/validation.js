"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookEventSchema = void 0;
const zod_1 = require("zod");
// Address Schema
const AddressSchema = zod_1.z.object({
    city: zod_1.z.string().nullable(),
    country: zod_1.z.string().nullable(),
    line1: zod_1.z.string().nullable(),
    line2: zod_1.z.string().nullable(),
    postal_code: zod_1.z.string().nullable(),
    state: zod_1.z.string().nullable(),
});
// Billing Schema
const BillingSchema = zod_1.z.object({
    address: AddressSchema,
    email: zod_1.z.string().nullable(),
    name: zod_1.z.string().nullable(),
    phone: zod_1.z.string().nullable(),
});
// Line Item Schema
const LineItemSchema = zod_1.z.object({
    amount: zod_1.z.number(),
    currency: zod_1.z.string(),
    description: zod_1.z.string().nullable(),
    images: zod_1.z.array(zod_1.z.string()).optional(),
    name: zod_1.z.string(),
    quantity: zod_1.z.number(),
});
// Payment Source Schema
const PaymentSourceSchema = zod_1.z.object({
    id: zod_1.z.string(),
    type: zod_1.z.string(),
    brand: zod_1.z.string().optional(),
    country: zod_1.z.string().optional(),
    last4: zod_1.z.string().optional(),
});
// Payment Schema
const PaymentSchema = zod_1.z.object({
    id: zod_1.z.string(),
    type: zod_1.z.literal("payment"),
    attributes: zod_1.z.object({
        amount: zod_1.z.number(),
        currency: zod_1.z.string(),
        status: zod_1.z.string(),
        fee: zod_1.z.number().optional(),
        foreign_fee: zod_1.z.number().optional(),
        net_amount: zod_1.z.number().optional(),
        tax_amount: zod_1.z.number().optional(),
        metadata: zod_1.z.record(zod_1.z.string()).optional(),
        source: PaymentSourceSchema.optional(),
        billing: BillingSchema.optional(),
    }),
});
// Webhook Schema
exports.WebhookEventSchema = zod_1.z.object({
    data: zod_1.z.object({
        id: zod_1.z.string(),
        type: zod_1.z.literal("event"),
        attributes: zod_1.z.object({
            type: zod_1.z.string(), // "checkout_session.payment.paid"
            livemode: zod_1.z.boolean(),
            data: zod_1.z.object({
                id: zod_1.z.string(),
                type: zod_1.z.string(), // "checkout_session"
                attributes: zod_1.z.object({
                    description: zod_1.z.string().optional(),
                    reference_number: zod_1.z.string().optional(),
                    status: zod_1.z.string().optional(),
                    line_items: zod_1.z.array(LineItemSchema),
                    payments: zod_1.z.array(PaymentSchema),
                }),
            }),
        }),
    }),
});
