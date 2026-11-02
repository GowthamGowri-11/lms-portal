import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

// In-memory cache for user role and onboarding status to avoid remote DB roundtrips on every page navigation
const userRoleCache = new Map<string, { role: string; isOnboarded: boolean; timestamp: number }>();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

export function invalidateUserCache(userId: string) {
  userRoleCache.delete(userId);
}

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
        userRoleCache.set(user.id, {
          role: token.role as string,
          isOnboarded: token.isOnboarded as boolean,
          timestamp: Date.now(),
        });
      } else if (token.id) {
        const cached = userRoleCache.get(token.id as string);
        const now = Date.now();
        if (cached && now - cached.timestamp < CACHE_TTL_MS) {
          token.role = cached.role;
          token.isOnboarded = cached.isOnboarded;
        } else {
          // Fetch the latest role and onboarding status from the database on subsequent token validations
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { role: true, isOnboarded: true },
          });
          if (dbUser) {
            token.role = dbUser.role;
            token.isOnboarded = dbUser.isOnboarded;
            userRoleCache.set(token.id as string, {
              role: dbUser.role,
              isOnboarded: dbUser.isOnboarded,
              timestamp: now,
            });
          }
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
