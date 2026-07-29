import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "PLACEHOLDER_GOOGLE_CLIENT_ID",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "PLACEHOLDER_GOOGLE_CLIENT_SECRET",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      // When the user first logs in, user object is available
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "GUEST";
        token.isOnboarded = (user as any).isOnboarded || false;
      } else if (token.id) {
        // Fetch the latest role and onboarding status from the database on subsequent token validations
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, isOnboarded: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.isOnboarded = dbUser.isOnboarded;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).isOnboarded = token.isOnboarded;
      }
      return session;
    },
  },
};
