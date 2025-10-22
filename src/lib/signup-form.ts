import { z } from "zod";

// Zod validation schema
export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  agreed: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms & policy",
  }),
});

export type SignupFormData = z.infer<typeof signupSchema>;

// Form field configurations
export const formFields = [
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

export const switchFields = [
  {
    name: "agreed" as const,
    label: "I agree to the terms & policy",
  },
] as const;
