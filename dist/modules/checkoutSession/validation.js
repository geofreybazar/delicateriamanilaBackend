"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePaymongoPaymentRequestSchema = exports.CheckoutSessionSchema = void 0;
const zod_1 = require("zod");
exports.CheckoutSessionSchema = zod_1.z.object({
    guestId: zod_1.z.string().min(1, "Guess Id is required"),
    totalPrice: zod_1.z.number().min(1, "Total price is required"),
    isFreeDelivery: zod_1.z.boolean(),
    items: zod_1.z.array(zod_1.z.object({
        productid: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ProductId"),
        name: zod_1.z.string().min(1, "Product name is required"),
        quantity: zod_1.z.number().min(1, "Quantity is required"),
        price: zod_1.z.number().min(1, "Price is required"),
        imgUrl: zod_1.z.string().min(1, "Image URl is required"),
    })),
});
exports.CreatePaymongoPaymentRequestSchema = zod_1.z.object({
    emailAddress: zod_1.z.string().email("Invalid email address"),
    firstName: zod_1.z.string().min(1, "First name is required"),
    lastName: zod_1.z.string().min(1, "Last name is required"),
    address: zod_1.z.string().min(1, "Address is required"),
    postalCode: zod_1.z.string().min(1, "Postal code is required"),
    city: zod_1.z.string().min(1, "City is required"),
    phoneNumber: zod_1.z
        .string()
        .min(10, "Phone number must be at least 10 digits")
        .max(15, "Phone number must be at most 15 digits")
        .regex(/^[0-9]+$/, "Phone number must contain only numbers"),
    shippingFee: zod_1.z.number(),
    sessionId: zod_1.z.string().min(1, "Session ID is required"),
    items: zod_1.z
        .array(zod_1.z.object({
        productId: zod_1.z.string().min(1, "Product ID is required"),
        name: zod_1.z.string().min(1, "Product name is required"),
        quantity: zod_1.z.number().int().positive("Quantity must be greater than 0"),
        price: zod_1.z.number().nonnegative("Price must be 0 or greater"),
        imgUrl: zod_1.z.string().url("Invalid image URL"),
        _id: zod_1.z.string().min(1, "_id is required"),
    }))
        .min(1, "At least one item is required"),
});
