import { z } from "zod";

export const userSchema = z.object({
  firstname: z.string(),
  lastname: z.string(),
  middlename: z.string(),
  email: z.string().email(),
  phoneNumber: z.string().regex(/^(09\d{9}|(\+639)\d{9})$/, {
    message: "Invalid Philippine mobile number",
  }),
  role: z.string(),
});

export type UserType = z.infer<typeof userSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^a-zA-Z0-9]/,
      "Password must contain at least one special character"
    ),
});
export type LoginType = z.infer<typeof loginSchema>;

export const logoutSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid user ID"),
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export type LogoutType = z.infer<typeof logoutSchema>;

export const getUserSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid user ID"),
});

export const updateUserSchema = userSchema.omit({ role: true });

export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^a-zA-Z0-9]/,
      "Current Password must contain at least one special character"
    ),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^a-zA-Z0-9]/,
      "New Password must contain at least one special character"
    ),
  confirmPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^a-zA-Z0-9]/,
      "Confirm Password must contain at least one special character"
    ),
});

export type ChangePasswordType = z.infer<typeof changePasswordSchema>;
