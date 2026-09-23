import { z } from "zod";

const name = z.string().trim().min(1, "This field is required").max(80);
const email = z.string().trim().email("Enter a valid email address").max(254);

export const registerSchema = z.object({
  firstName: name,
  lastName: name,
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username may contain only letters, numbers, and underscores"),
  email,
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
  dateOfBirth: z.coerce.date().refine((date) => date <= new Date(), "Date of birth cannot be in the future"),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({ email });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;