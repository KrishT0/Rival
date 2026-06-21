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

export const signUpAuthSchema = authSchema
  .extend({
    confirmPassword: z
      .string()
      .trim()
      .min(1, "Confirm password is required")
      .pipe(
        z.string().min(6, "Confirm password must be at least 6 characters"),
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type AuthFormData = z.infer<typeof authSchema>;
export type SignUpAuthFormData = z.infer<typeof signUpAuthSchema>;
