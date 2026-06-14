import * as z from "zod";

export const authSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .pipe(z.email("Please enter a valid email address")),
  password: z
    .string()
    .trim()
    .min(1, "Password is required")
    .pipe(z.string().min(6, "Password must be at least 6 characters")),
});

export type AuthFormData = z.infer<typeof authSchema>;
