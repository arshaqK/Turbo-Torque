// Next Js
import { NextResponse, NextRequest } from "next/server";

// Jwt
import { jwtVerify } from "jose";
import { COOKIE_NAME } from "./constants";

const JWT_SECRET = process.env.JWT_SECRET || "";

export async function middleware(req: NextRequest) {
  try {
    // **Ignore the following routes
    const toIgnore = ["/api/users/auth", "/api/brands/auth"];

    for (const route of toIgnore) {
      if (req.nextUrl.pathname.startsWith(route)) {
        return NextResponse.next();
      }
    }

    // Step 1: Get the token
    const tokenValue = req.cookies.get(COOKIE_NAME)?.value;

    // No token
    if (!tokenValue) return NextResponse.json({ message: "Authentication required" }, { status: 401 });

    // Step 2: Verify the token
    const { payload } = await jwtVerify(tokenValue, new TextEncoder().encode(JWT_SECRET));
    const userEmail = payload.email as string;

    // Step 3: Add the email to the request object
    const response = NextResponse.next();
    response.headers.set("x-user-email", userEmail);
    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Invalid or expired token" }, { status: 401 });
  }
}

export const config = {
  matcher: ["/api/users", "/api/users/:id*", "/dashboard", "/api/brands", "/api/brands/:id*"],
};
