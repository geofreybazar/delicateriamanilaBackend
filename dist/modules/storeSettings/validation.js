"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeSettingsSchema = void 0;
const zod_1 = require("zod");
const storeHoursSchema = zod_1.z.object({
    day: zod_1.z.enum([
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
    ]),
    open: zod_1.z
        .string()
        .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Must be in HH:mm format"),
    close: zod_1.z
        .string()
        .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Must be in HH:mm format"),
    isOpen: zod_1.z.boolean().optional(),
});
const generalSchema = zod_1.z.object({
    storeName: zod_1.z.string().min(1, "Store name is required"),
    email: zod_1.z.string().email("Invalid email address"),
    phone: zod_1.z.string().min(1, "Phone number is required"),
});
const addressSchema = zod_1.z.object({
    street: zod_1.z.string().min(1, "Street is required"),
    city: zod_1.z.string().min(1, "City is required"),
    state: zod_1.z.string().min(1, "State is required"),
    zipCode: zod_1.z.string().min(1, "ZIP code is required"),
    country: zod_1.z.string().min(1, "Country is required"),
});
const socialMediaSchema = zod_1.z.object({
    facebook: zod_1.z.string().url().optional().or(zod_1.z.literal("")),
    twitter: zod_1.z.string().url().optional().or(zod_1.z.literal("")),
    instagram: zod_1.z.string().url().optional().or(zod_1.z.literal("")),
    linkedin: zod_1.z.string().url().optional().or(zod_1.z.literal("")),
    youtube: zod_1.z.string().url().optional().or(zod_1.z.literal("")),
});
const dataProtectionOfficerSchema = zod_1.z.object({
    officerName: zod_1.z.string().optional().or(zod_1.z.literal("")),
    officerEmail: zod_1.z.string().email().optional().or(zod_1.z.literal("")),
    officerPhone: zod_1.z.string().optional().or(zod_1.z.literal("")),
    privacyPolicyUrl: zod_1.z.string().url().optional().or(zod_1.z.literal("")),
    termsUrl: zod_1.z.string().url().optional().or(zod_1.z.literal("")),
});
exports.storeSettingsSchema = zod_1.z.object({
    general: generalSchema,
    address: addressSchema,
    socialMedia: socialMediaSchema.optional(),
    dataProtectionOfficer: dataProtectionOfficerSchema.optional(),
    storeHours: zod_1.z.array(storeHoursSchema).length(7, "Must have 7 days"),
});
