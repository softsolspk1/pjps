import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username / Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Missing authentication credentials");
        }
        
        // 1. Check Environment-Based Admin
        const adminUsername = process.env.ADMIN_USERNAME;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (
          adminUsername &&
          adminPassword &&
          credentials.username === adminUsername &&
          credentials.password === adminPassword
        ) {
          return {
            id: "admin-static",
            name: "System Admin",
            email: "admin@pjps.pk",
            role: "ADMIN"
          };
        }

        // 2. Check Database Users
        const user = await prisma.user.findUnique({
          where: { email: credentials.username }
        });

        if (user) {
          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (isValid) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role
            };
          }
        }

        return null; // Return null instead of throwing to better handle failures in some NextAuth versions
      }
    }),
    {
      id: "orcid",
      name: "ORCID",
      type: "oauth",
      authorization: {
        url: `${process.env.ORCID_SANDBOX === "true" ? "https://sandbox.orcid.org" : "https://orcid.org"}/oauth/authorize`,
        params: { scope: "/authenticate" },
      },
      token: `${process.env.ORCID_SANDBOX === "true" ? "https://sandbox.orcid.org" : "https://orcid.org"}/oauth/token`,
      userinfo: `${process.env.ORCID_SANDBOX === "true" ? "https://pub.sandbox.orcid.org" : "https://pub.orcid.org"}/v3.0/oauth/userinfo`,
      checks: ["state"], // ORCID doesn't always support PKCE in all tiers, state is essential
      clientId: process.env.ORCID_CLIENT_ID || "",
      clientSecret: process.env.ORCID_CLIENT_SECRET || "",
      profile(profile: any) {
        return {
          id: profile.orcid || profile.sub,
          name: profile.name || "ORCID Scholar",
          email: profile.email || null,
        }
      },
    },
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "orcid") {
        const orcidId = (profile as any).orcid || profile?.sub;
        if (!orcidId) return false;

        // Check if user exists by ORCID
        let dbUser = await prisma.user.findFirst({
          where: { orcid: orcidId }
        });

        // Fallback: Check by email if ORCID profile has one
        if (!dbUser && user.email) {
          dbUser = await prisma.user.findUnique({
            where: { email: user.email }
          });
        }

        if (dbUser) {
          // Sync ORCID if not set
          if (!dbUser.orcid) {
            await prisma.user.update({
              where: { id: dbUser.id },
              data: { orcid: orcidId }
            });
          }
          user.id = dbUser.id;
          (user as any).role = dbUser.role;
          return true;
        }

        // Create new account for first-time ORCID users
        const newUserEmail = user.email || `${orcidId}@orcid.pjps.pk`;
        const newUser = await prisma.user.create({
          data: {
            email: newUserEmail,
            name: user.name || "ORCID Scholar",
            orcid: orcidId,
            password: await bcrypt.hash(Math.random().toString(36), 10),
            role: "AUTHOR"
          }
        });
        user.id = newUser.id;
        (user as any).role = newUser.role;
        return true;
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: '/admin/login',
  },
  secret: process.env.NEXTAUTH_SECRET || "pjps_legacy_fallback_secret_67890",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
