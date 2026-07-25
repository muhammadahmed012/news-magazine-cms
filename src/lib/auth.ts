// src/lib/auth.ts
import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { type JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User {
    role?: string;
    title?: string;
  }
  interface Session {
    user: {
      role?: string;
      title?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    title?: string;
    userId?: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const result = await db
          .select({
            id: users.id,
            name: users.name,
            email: users.email,
            image: users.image,
            role: users.role,
            title: users.title,
            passwordHash: users.passwordHash,
          })
          .from(users)
          .where(eq(users.email, credentials.email as string))
          .limit(1);

        const user = result[0];

        if (!user || !user.passwordHash) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name || undefined,
          email: user.email,
          image: user.image || undefined,
          role: user.role,
          title: user.title || undefined
        };
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.title = user.title;
        token.userId = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token) {
        session.user.role = token.role as string | undefined;
        session.user.title = token.title as string | undefined;
        (session.user as any).id = token.userId;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.AUTH_SECRET || "super-secret-auth-key-change-in-production-12345",
});
