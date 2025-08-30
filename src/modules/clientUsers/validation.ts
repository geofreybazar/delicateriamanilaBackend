import { z } from "zod";

export const clientUserLoginSchema = z.object({
  email: z.string().email(),
  provider: z.string().min(1, "Provider is required"),
});
export type ClientUserLoginType = z.infer<typeof clientUserLoginSchema>;

export const getClientUserSchema = z.string().email();
export type GetClientUserType = z.infer<typeof getClientUserSchema>;

export const SignUpFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  phoneNumber: z
    .string()
    .min(11, "Phone number must be at least 10 digits")
    .max(15, "Phone number must be at most 15 digits")
    .regex(/^[0-9]+$/, "Phone number must contain only numbers"),
  provider: z.string().min(1, "Provider is required"),
});

export type SignUpFormType = z.infer<typeof SignUpFormSchema>;

export const UpadateClientUserSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid User ID"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  phoneNumber: z
    .string()
    .min(11, "Phone number must be at least 10 digits")
    .max(15, "Phone number must be at most 15 digits")
    .regex(/^[0-9]+$/, "Phone number must contain only numbers"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
});

export type UpadateClientUserType = z.infer<typeof UpadateClientUserSchema>;
