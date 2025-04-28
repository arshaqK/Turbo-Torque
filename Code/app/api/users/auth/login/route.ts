// Database
import connectDB from "@/db/connectDB";

// Models
import User from "@/models/User";

// Next Js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Dependencies
import bcrypt from "bcryptjs";
import { sign } from "jsonwebtoken";
import { serialize } from "cookie";

// Constants
import { COOKIE_NAME, COOKIE_AGE } from "@/constants";

// Types
import { UserType } from "@/types";

interface UserRequest {
  email: string;
  password: string;
}

interface ErrorResponse {
  message: string;
}

// @desc    Login user
// @route   POST /api/users/auth/login
// @access  Public
export async function POST(request: Request): Promise<NextResponse<{ message: string; user?: UserType } | ErrorResponse>> {
  try {
    // Step 1: Check if someone is already logged in
    const cookieStore = await cookies();
    const existingToken = cookieStore.get(COOKIE_NAME);

    if (existingToken) {
      return NextResponse.json({ message: "Already logged in." }, { status: 400 });
    }

    // Step 2: Get the provided user information
    const { email, password } = (await request.json()) as UserRequest;

    // Step 3: Check if all the required fields are present
    if (!email?.trim() || !password?.trim()) {
      return NextResponse.json({ message: "Please fill in all the required fields." }, { status: 400 });
    }

    // Step 4: Connect to the database
    await connectDB();

    // Step 5: Check if a user with the same email exists
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return NextResponse.json({ message: "Unknown email address." }, { status: 404 });
    }

    // Step 6: User exists - decrypt & compare their password
    const isMatch = await bcrypt.compare(password, existingUser.password);

    if (!isMatch) {
      return NextResponse.json({ message: "Invalid credentials." }, { status: 401 });
    }

    // Step 7: Generate a JWT token for the user
    const secret = process.env.JWT_SECRET || ""; // Always check this
    const token = sign({ email: existingUser.email }, secret, { expiresIn: COOKIE_AGE });

    const serialized = serialize(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: COOKIE_AGE,
    });

    // Step 8: Return the existing user (with only necessary fields for security)
    const userResponse: UserType = {
      _id: existingUser._id.toString(),
      name: existingUser.name,
      email: existingUser.email,
      phoneNumber: existingUser.phoneNumber,
      role: existingUser.role,
    };

    return NextResponse.json({ message: "User logged in successfully", user: userResponse }, { status: 200, headers: { "Set-Cookie": serialized } });
  } catch (error: unknown) {
    console.error("Error in user signup:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ message: "An error occurred while logging in." }, { status: 500 });
  }
}
