import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { signInApi } from "./endPoint";

declare module "next-auth" {
  interface Session {
    user: {
      token: string;
      userId: number;
      branchId: number;
    };
  }
  interface User {
    token: string;
    userId: number;
    branchId: number;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "login",
      name: "Credentials",
      credentials: {
        usernameOrEmail: {
          label: "usernameOrEmail",
          type: "text",
          placeholder: "Enter your usernameOrEmail",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Enter your password",
        },
      },
      async authorize(credentials) {
        try {
          if (!credentials) {
            throw new Error("Credentials are missing");
          }

          const data = await signInApi({
            usernameOrEmail: credentials.usernameOrEmail,
            password: credentials.password,
          });

          if (!data.isSuccess) {
            throw new Error(data.message || "Error in login, please try again");
          }
          // if (data.data.user.isBlocked) {
          //   throw new Error(data.data.message || "Your account is blocked.");
          // } else if (!data.data.user.isActive) {
          //   throw new Error(
          //     data.data.message || "Your account is not active yet."
          //   );
          // }
          else if (data.data.user.isActive) {
            return {
              id: String(data.data.user.id),
              token: data.data.token,
              userId: data.data.user.id,
              branchId: data.data.user.branchId,
            };
          } else {
            throw new Error(data.message || "Unexpected login response");
          }
        } catch (error) {
          if (error instanceof Error) {
            throw new Error(error.message || "Can't login, please try again");
          } else {
            throw new Error("Can't login, please try again");
          }
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.token = token.authKey as string;
        session.user.userId = token.userId as number;
        session.user.branchId = token.branchId as number;
      }
      return session;
    },
    async jwt({ token, user }) {
      // if (trigger === "update") {
      //   return {
      //     ...token,
      //     ...session.user,
      //   };
      // }
      if (user) {
        token.authKey = user.token;
        token.userId = user.userId;
        token.branchId = user.branchId;
      }
      return token;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/auth1/login",
  },
};
