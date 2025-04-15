// types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  /**
   * Extendendo o tipo User
   */
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
  
  /**
   * Extendendo o tipo Session
   */
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  /** Extendendo o tipo JWT */
  interface JWT {
    id: string;
  }
}