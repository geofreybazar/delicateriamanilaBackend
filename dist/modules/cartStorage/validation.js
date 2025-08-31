"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCartSchema = exports.CreateClientUserCartSchema = exports.AddItemServiceSchema = exports.CreateCartServiceSchema = void 0;
const zod_1 = require("zod");
exports.CreateCartServiceSchema = zod_1.z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid ProductId");
exports.AddItemServiceSchema = zod_1.z.object({
    cartId: zod_1.z.string().min(1, "Cart id is required"),
    productId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ProductId"),
});
exports.CreateClientUserCartSchema = zod_1.z.object({
    userId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Client User id"),
    productId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Product id"),
});
exports.getCartSchema = zod_1.z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid Client User id or cart id");
