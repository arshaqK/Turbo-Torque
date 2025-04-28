import { EmailType } from "./types";

declare module "next/server" {
  interface NextRequest {
    userEmail?: EmailType;
  }
}
