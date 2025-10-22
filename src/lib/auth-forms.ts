import { z } from "zod";

// Sign-in validation schema
export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

// Sign-up validation schema
export const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  agreed: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms & policy",
  }),
});

// Forgot password validation schema
export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export type SignInFormData = z.infer<typeof signInSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// Form field configurations
export const signInFields = [
  {
    name: "email" as const,
    label: "Email address",
    placeholder: "Enter your email",
    type: "email" as const,
  },
  {
    name: "password" as const,
    label: "Password",
    placeholder: "Enter your password",
    type: "password" as const,
  },
] as const;

export const signUpFields = [
  {
    name: "name" as const,
    label: "Name",
    placeholder: "Enter your name",
    type: "text" as const,
  },
  {
    name: "email" as const,
    label: "Email address",
    placeholder: "Enter your email",
    type: "email" as const,
  },
  {
    name: "password" as const,
    label: "Password",
    placeholder: "Enter your password",
    type: "password" as const,
  },
] as const;

export const forgotPasswordFields = [
  {
    name: "email" as const,
    label: "Email address",
    placeholder: "Enter your email",
    type: "email" as const,
  },
] as const;

export const signUpSwitchFields = [
  {
    name: "agreed" as const,
    label: "I agree to the terms & policy",
  },
] as const;
