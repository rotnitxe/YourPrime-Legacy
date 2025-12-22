
import * as z from "zod";

export const LoginSchema = z.object({
  email: z.string().email({
    message: "Se requiere un email válido",
  }),
  password: z.string().min(1, {
    message: "La contraseña es requerida",
  }),
  code: z.optional(z.string()), // Código 2FA opcional
});

export const RegisterSchema = z.object({
  email: z.string().email({
    message: "Se requiere un email válido",
  }),
  password: z.string().min(8, {
    message: "Mínimo 8 caracteres",
  }),
  name: z.string().min(1, {
    message: "El nombre es requerido",
  }),
});

export const ResetSchema = z.object({
  email: z.string().email({
    message: "Se requiere un email válido",
  }),
});

export const NewPasswordSchema = z.object({
  password: z.string().min(8, {
    message: "Mínimo 8 caracteres",
  }),
});
