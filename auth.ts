
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import authConfig from "@/auth.config";
import { UserRole } from "@prisma/client";

// Helpers simulados para compilación (deben importarse de @/data/user)
const getUserById = async (id: string) => {
    return await db.user.findUnique({ where: { id }});
};
const getTwoFactorConfirmationByUserId = async (userId: string) => {
    return await db.twoFactorConfirmation.findUnique({ where: { userId }});
};

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  events: {
    async linkAccount({ user }) {
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() }
      })
    }
  },
  callbacks: {
    async signIn({ user, account }) {
      // Permitir OAuth sin verificación de email
      if (account?.provider !== "credentials") return true;

      const existingUser = await getUserById(user.id || '');

      // Prevenir login si el email no está verificado
      if (!existingUser?.emailVerified) return false;

      // Lógica de 2FA
      if (existingUser.isTwoFactorEnabled) {
        const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id);
        
        if (!twoFactorConfirmation) return false;
        
        // Borrar confirmación para el próximo login (2FA estricto en cada sesión nueva)
        await db.twoFactorConfirmation.delete({
            where: { id: twoFactorConfirmation.id }
        });
      }

      return true;
    },
    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      if (token.role && session.user) {
        // @ts-ignore
        session.user.role = token.role as UserRole;
      }
      
      if (session.user) {
         // @ts-ignore
         session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean;
         session.user.name = token.name;
         session.user.email = token.email;
         // @ts-ignore
         session.user.permissions = token.permissions;
      }

      return session;
    },
    async jwt({ token }) {
      if (!token.sub) return token;

      const existingUser = await getUserById(token.sub);
      if (!existingUser) return token;

      token.name = existingUser.name;
      token.email = existingUser.email;
      token.role = existingUser.role;
      // @ts-ignore
      token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled;
      // @ts-ignore
      token.permissions = existingUser.permissions;

      return token;
    }
  },
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  ...authConfig,
});
