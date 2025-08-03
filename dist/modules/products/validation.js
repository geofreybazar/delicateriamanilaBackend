"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.featuredProductsSchema = exports.getProductSchema = exports.deleteProductsSchema = exports.addProductSchema = void 0;
const zod_1 = require("zod");
exports.addProductSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Product name is required"),
    description: zod_1.z.string().min(1, "Product description is required"),
    category: zod_1.z.string().min(1, "Product category is required"),
    price: zod_1.z.coerce
        .number({
        required_error: "Price is required",
        invalid_type_error: "Price must be a number",
    })
        .positive("Price must be a positive number"),
    featured: zod_1.z.string(),
    status: zod_1.z.enum(["Active", "Inactive"], {
        errorMap: () => ({
            message: "Status must be either 'active' or 'inactive'",
        }),
    }),
    stockQuantity: zod_1.z.coerce
        .number({
        required_error: "Stock quantity is required",
        invalid_type_error: "Stock quantity must be a number",
    })
        .int("Stock quantity must be a whole number")
        .nonnegative("Stock quantity cannot be negative"),
});
exports.deleteProductsSchema = zod_1.z.array(zod_1.z.string().regex(/^[a-f\d]{24}$/i, "Invalid product ID"));
exports.getProductSchema = zod_1.z
    .string()
    .regex(/^[a-f\d]{24}$/i, "Invalid product ID");
exports.featuredProductsSchema = zod_1.z.object({
    page: zod_1.z.string().min(1, "Page must be at least 1"),
    limit: zod_1.z.string().min(1, "Limit must be at least 1"),
});
