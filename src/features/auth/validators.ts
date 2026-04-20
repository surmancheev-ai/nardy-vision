import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Введите корректный email.").trim().toLowerCase(),
  password: z
    .string()
    .min(8, "Пароль должен содержать минимум 8 символов.")
    .max(72, "Пароль слишком длинный."),
});

export const registerSchema = loginSchema.extend({
  name: z
    .string()
    .trim()
    .min(2, "Введите имя длиной не менее 2 символов.")
    .max(80, "Имя слишком длинное."),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Пароли не совпадают.",
  path: ["confirmPassword"],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
