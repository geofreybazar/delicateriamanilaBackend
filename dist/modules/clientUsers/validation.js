"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpadateClientUserSchema = exports.SignUpFormSchema = exports.getClientUserSchema = exports.clientUserLoginSchema = void 0;
const zod_1 = require("zod");
exports.clientUserLoginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    provider: zod_1.z.string().min(1, "Provider is required"),
});
exports.getClientUserSchema = zod_1.z.string().email();
exports.SignUpFormSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1, "First name is required"),
    lastName: zod_1.z.string().min(1, "Last name is required"),
    email: zod_1.z.string().email("Invalid email address").min(1, "Email is required"),
    phoneNumber: zod_1.z
        .string()
        .min(11, "Phone number must be at least 10 digits")
        .max(15, "Phone number must be at most 15 digits")
        .regex(/^[0-9]+$/, "Phone number must contain only numbers"),
    provider: zod_1.z.string().min(1, "Provider is required"),
});
exports.UpadateClientUserSchema = zod_1.z.object({
    id: zod_1.z.string().regex(/^[a-f\d]{24}$/i, "Invalid User ID"),
    firstName: zod_1.z.string().min(1, "First name is required"),
    lastName: zod_1.z.string().min(1, "Last name is required"),
    email: zod_1.z.string().email("Invalid email address").min(1, "Email is required"),
    phoneNumber: zod_1.z
        .string()
        .min(11, "Phone number must be at least 10 digits")
        .max(15, "Phone number must be at most 15 digits")
        .regex(/^[0-9]+$/, "Phone number must contain only numbers"),
    address: zod_1.z.string().min(1, "Address is required"),
    city: zod_1.z.string().min(1, "City is required"),
});
