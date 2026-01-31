import "next-auth";

declare module "*.css";
declare module "*.scss";
declare module "*.sass";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    error?: string;
  }
}
