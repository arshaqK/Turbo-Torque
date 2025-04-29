// Next Js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Dependancies
import { serialize } from "cookie";

// Constants
import { COOKIE_NAME } from "@/constants";

export async function POST(): Promise<NextResponse> {
  try {
    // Step 1: Check if no one is logged in
    const cookieStore = await cookies();
    const existingToken = cookieStore.get(COOKIE_NAME);

    if (!existingToken) {
      return NextResponse.json({ message: "Already logged out." }, { status: 400 });
    }

    // Step 2: Create a cookie that expires immediately to clear it
    const serialized = serialize(COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: -1,
    });

    return NextResponse.json({ message: "Logged out successfully" }, { status: 200, headers: { "Set-Cookie": serialized } });
  } catch (error) {
    console.error("Error logging out:", error);
    return NextResponse.json({ error: "An unknown error occurred. Please try again later." }, { status: 500 });
  }
}
