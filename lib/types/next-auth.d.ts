// Extend NextAuth session user type to include id
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      isOrganizer?: boolean;
      status?: string;
    };
  }

  interface User {
    role?: string;
    isOrganizer?: boolean;
    status?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    isOrganizer?: boolean;
    status?: string;
  }
}
