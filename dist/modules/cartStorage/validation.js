"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddItemServiceSchema = exports.CreateCartServiceSchema = void 0;
const zod_1 = require("zod");
exports.CreateCartServiceSchema = zod_1.z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid ProductId");
exports.AddItemServiceSchema = zod_1.z.object({
    cartId: zod_1.z.string().min(1, "Cart id is required"),
    productId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ProductId"),
});
