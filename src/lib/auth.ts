// src/lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import { compare } from "bcryptjs";

const isProd = process.env.NODE_ENV === "production";

export const authOptions: NextAuthOptions = {
  trustHost: true,
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 }, // 7 días
  pages: { signIn: "/auth/login" },
  cookies: {
    // NextAuth ajusta secure automáticamente con https, pero dejamos explícito:
    sessionToken: {
      name: isProd ? "__Secure-next-auth.session-token" : "next-auth.session-token",
      options: { httpOnly: true, sameSite: "lax", path: "/", secure: isProd },
    },
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Correo", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim();
        const password = credentials?.password ?? "";
        if (!email || !password) return null;

        // (Opcional) lockout básico por usuario en memoria (para dev). Para prod, usa Redis.
        // Puedes implementar Upstash Ratelimit por combinación email/IP.

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.hash) return null;

        const pepper = process.env.PASSWORD_PEPPER ?? "";
        const ok = await compare(password + pepper, user.hash);
        if (!ok) return null;

        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as any).role;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  debug: !isProd,
};
