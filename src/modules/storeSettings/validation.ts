import { z } from "zod";

const storeHoursSchema = z.object({
  day: z.enum([
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ]),
  open: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Must be in HH:mm format"),
  close: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Must be in HH:mm format"),
  isOpen: z.boolean().optional(),
});

const generalSchema = z.object({
  storeName: z.string().min(1, "Store name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
});

const addressSchema = z.object({
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "ZIP code is required"),
  country: z.string().min(1, "Country is required"),
});

const socialMediaSchema = z.object({
  facebook: z.string().url().optional().or(z.literal("")),
  twitter: z.string().url().optional().or(z.literal("")),
  instagram: z.string().url().optional().or(z.literal("")),
  linkedin: z.string().url().optional().or(z.literal("")),
  youtube: z.string().url().optional().or(z.literal("")),
});

const dataProtectionOfficerSchema = z.object({
  officerName: z.string().optional().or(z.literal("")),
  officerEmail: z.string().email().optional().or(z.literal("")),
  officerPhone: z.string().optional().or(z.literal("")),
  privacyPolicyUrl: z.string().url().optional().or(z.literal("")),
  termsUrl: z.string().url().optional().or(z.literal("")),
});

export const storeSettingsSchema = z.object({
  general: generalSchema,
  address: addressSchema,
  socialMedia: socialMediaSchema.optional(),
  dataProtectionOfficer: dataProtectionOfficerSchema.optional(),
  storeHours: z.array(storeHoursSchema).length(7, "Must have 7 days"),
});
export type StoreSettingsType = z.infer<typeof storeSettingsSchema>;
