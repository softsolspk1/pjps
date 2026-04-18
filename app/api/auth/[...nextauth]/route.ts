import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Invalid credentials");
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

        // 2. Check Database Users (New Demo System)
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

        throw new Error("Invalid access credentials");
      }
    }),
    {
      id: "orcid",
      name: "ORCID",
      type: "oauth",
      wellKnown: "https://orcid.org/.well-known/openid-configuration",
      authorization: { params: { scope: "openid" } },
      idToken: true,
      clientId: process.env.ORCID_CLIENT_ID,
      clientSecret: process.env.ORCID_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
        }
      },
    },
  ],
  session: {
    strategy: "jwt",
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
          // Update ORCID if not set
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

        // Auto-create Author account if user doesn't exist
        const newUser = await prisma.user.create({
          data: {
            email: user.email || `${orcidId}@orcid.pjps.pk`,
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
    async jwt({ token, user }) {
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
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
