// Database
import connectDB from "@/db/connectDB";

// Models
import User from "@/models/User";

// Next.js
import { NextResponse } from "next/server";

// Dependencies
import bcrypt from "bcryptjs";

// Types
import { UserType } from "@/types";

interface UserRequest {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
}

interface ErrorResponse {
  message: string;
}

// @desc    Create new user
// @route   POST /api/users/auth/signup
// @access  Public
export async function POST(request: Request): Promise<NextResponse<{ message: string; user?: UserType } | ErrorResponse>> {
  try {
    // Step 1: Get the provided user information
    const { name, email, phoneNumber, password } = (await request.json()) as UserRequest;

    // Step 2: Check if all the required fields are present
    if (!name?.trim() || !email?.trim() || !phoneNumber?.trim() || !password?.trim()) {
      return NextResponse.json({ message: "Please fill in all the required fields." }, { status: 400 });
    }

    // Step 3: Connect to the database
    await connectDB();

    // Step 4: Check if a user with the same email or phone number already exists
    const existingUser = await User.findOne({ $or: [{ email: email.toLowerCase() }, { phoneNumber }] });

    if (existingUser) {
      return NextResponse.json({ message: `Existing ${email === existingUser.email ? "email" : "phone number"}.` }, { status: 409 });
    }

    // Step 5: User does not exist - hash their password (for security)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Step 6: Create a new user
    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phoneNumber: phoneNumber.trim(),
      password: hashedPassword,
    });

    // Step 7: Return the new user
    const userResponse: UserType = {
      _id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      phoneNumber: newUser.phoneNumber,
      role: newUser.role,
    };

    return NextResponse.json({ message: "User created successfully", user: userResponse }, { status: 201 });
  } catch (error) {
    console.error("Error in user signup:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ message: "An error occurred during signup." }, { status: 500 });
  }
}
