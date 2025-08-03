"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderSchemaZ = exports.OrderItemSchema = void 0;
const zod_1 = require("zod");
exports.OrderItemSchema = zod_1.z.object({
    name: zod_1.z.string(),
    quantity: zod_1.z.number().min(1),
    price: zod_1.z.number().min(0),
    imgUrl: zod_1.z.string().url(),
    desciption: zod_1.z.string().optional(),
});
exports.OrderSchemaZ = zod_1.z.object({
    webhookId: zod_1.z.string(),
    type: zod_1.z.string(),
    status: zod_1.z.boolean(),
    totalAmount: zod_1.z.number().min(0),
    customerDetails: zod_1.z.object({
        name: zod_1.z.string(),
        email: zod_1.z.string().email(),
        phoneNumber: zod_1.z.string(),
    }),
    deliveryAddress: zod_1.z.object({
        line1: zod_1.z.string().optional(),
        city: zod_1.z.string(),
        postaCode: zod_1.z.number(),
        state: zod_1.z.string(),
    }),
    itemsOrdered: zod_1.z.array(exports.OrderItemSchema),
});
