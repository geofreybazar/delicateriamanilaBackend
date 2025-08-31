"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderPickedupServiceSchema = exports.AssignDeliveryServiceSchema = exports.orderIdSchema = void 0;
const zod_1 = require("zod");
exports.orderIdSchema = zod_1.z
    .string()
    .regex(/^[a-f\d]{24}$/i, "Invalid product ID");
exports.AssignDeliveryServiceSchema = zod_1.z.object({
    orderId: zod_1.z.string().regex(/^[a-f\d]{24}$/i, "Invalid order ID"),
    riderId: zod_1.z.string().regex(/^[a-f\d]{24}$/i, "Invalid rider ID"),
});
exports.OrderPickedupServiceSchema = zod_1.z.object({
    orderId: zod_1.z.string().regex(/^[a-f\d]{24}$/i, "Invalid order ID"),
    trackingNumber: zod_1.z.string().min(1, "Reference number is required"),
    modeOfPickup: zod_1.z.string().min(1, "Mode of Pickup is required"),
    pickupPersonName: zod_1.z.string().min(1, "Pickup Person name is required"),
    validId: zod_1.z.string().min(1, "Valid id is required"),
    idNumber: zod_1.z.string().min(1, "Id number is required"),
    contactNumber: zod_1.z.string().regex(/^(09\d{9}|(\+639)\d{9})$/, {
        message: "Invalid Philippine mobile number",
    }),
    pickupDateAndTime: zod_1.z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date string",
    })
        .transform((val) => new Date(val)),
});
