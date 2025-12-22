
"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { RegisterSchema, LoginSchema } from "@/schemas/auth";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";

// Rate Limit simple en memoria (Production: usar Redis/Upstash)
const rateLimitMap = new Map<string, { count: number, expires: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (record && now < record.expires) {
    if (record.count >= 5) return false;
    record.count++;
  } else {
    rateLimitMap.set(ip, { count: 1, expires: now + 15 * 60 * 1000 });
  }
  return true;
}

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Campos inválidos" };
  }

  const { email, password, name } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await db.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: "El email ya está en uso" };
  }

  await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  // TODO: Generar token de verificación y enviar email
  // const verificationToken = await generateVerificationToken(email);
  // await sendVerificationEmail(...)

  return { success: "Usuario creado. Por favor verifica tu email." };
};

export const login = async (values: z.infer<typeof LoginSchema>, clientIp: string) => {
  if (!checkRateLimit(clientIp)) {
     return { error: "Demasiados intentos. Inténtalo más tarde." }
  }

  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) return { error: "Campos inválidos" };

  const { email, password, code } = validatedFields.data;

  const existingUser = await db.user.findUnique({ where: { email } });

  if (!existingUser || !existingUser.email || !existingUser.password) {
    return { error: "Credenciales inválidas" };
  }

  if (!existingUser.emailVerified) {
    // TODO: Re-enviar token
    return { error: "Email no verificado" };
  }

  // Lógica MFA
  if (existingUser.isTwoFactorEnabled && existingUser.email) {
    if (code) {
      const twoFactorToken = await db.twoFactorToken.findFirst({
        where: { email: existingUser.email }
      });

      if (!twoFactorToken || twoFactorToken.token !== code) {
        return { error: "Código inválido" };
      }

      const hasExpired = new Date(twoFactorToken.expires) < new Date();
      if (hasExpired) return { error: "Código expirado" };

      await db.twoFactorToken.delete({ where: { id: twoFactorToken.id } });

      const existingConfirmation = await db.twoFactorConfirmation.findUnique({
        where: { userId: existingUser.id }
      });

      if (existingConfirmation) {
        await db.twoFactorConfirmation.delete({ where: { id: existingConfirmation.id } });
      }

      await db.twoFactorConfirmation.create({
        data: { userId: existingUser.id }
      });

    } else {
        // Generar y enviar código 2FA
        // const token = await generateTwoFactorToken(existingUser.email);
        // await sendTwoFactorTokenEmail(...);
        return { twoFactor: true };
    }
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Credenciales inválidas" };
        default:
          return { error: "Error de autenticación" };
      }
    }
    throw error;
  }
};
