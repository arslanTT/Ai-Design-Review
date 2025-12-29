import z from "zod";

export const signupSchema = z.object({
  username: z
    .string()
    .min(5, { message: "username must at lease 5 chracters" }),
  email: z.email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(5, { message: "Password must be at least 5 chracters" }),
});

export const signinSchema = z.object({
  email: z.email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(5, { message: "Password must be at least 5 chracters" }),
});

export type SignupBody = z.infer<typeof signupSchema>;
export type SigninBody = z.infer<typeof signinSchema>;
