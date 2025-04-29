// Database
import connectDB from "@/db/connectDB";

// Models
import User from "@/models/User";

// Next Js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Dependencies
import { verify } from "jsonwebtoken";

// Constants
import { COOKIE_NAME } from "@/constants";

// Types
import { UserType } from "@/types";

export async function GET(): Promise<NextResponse<{ message: string; user?: UserType }>> {
  try {
    // Step 1: Get the JWT token from the cookie
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME);

    if (!token) {
      return NextResponse.json({ message: "Not authorized." }, { status: 401 });
    }

    // Step 2: Get the token's value & the JWT secret
    const { value } = token;
    const secret = process.env.JWT_SECRET || ""; // Always check this

    try {
      // Step 3: Verify the JWT token
      const decoded = verify(value, secret) as { email: string };

      // Step 4: Connect to the database
      await connectDB();

      // Step 5: Get the user
      const user = await User.findOne({ email: decoded.email });

      if (!user) {
        return NextResponse.json({ message: "User not found." }, { status: 404 });
      }

      // Step 6: Return user data (excluding sensitive information)
      const userResponse: UserType = {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
      };

      return NextResponse.json({ message: "Authenticated.", user: userResponse }, { status: 200 });
    } catch (error) {
      console.error("Token verification error:", error);
      return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
    }
  } catch (error) {
    console.error("Internal server error:", error);
    return NextResponse.json({ message: "Server error." }, { status: 500 });
  }
}
