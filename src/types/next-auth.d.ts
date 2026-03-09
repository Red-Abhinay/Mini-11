import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string; 
      name: string;
      email: string;
      role: "manager" | "employee"; 
    };
  }

  interface User {
    id: string;
    role: "manager" | "employee";
  }
}