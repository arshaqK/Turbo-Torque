// Database
import connectDB from "@/db/connectDB";

// Models
import User from "@/models/User";

// Middlewares
import { adminMiddleware } from "@/middlewares/admin";

// Next Js
import { NextResponse, NextRequest } from "next/server";

// Types
interface FetchedUsers {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role?: string;
}

// @desc    Get all users
// @route   GET /api/users
// @access  Private
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: Check if the user is an admin
    const adminResponse = await adminMiddleware(req);
    if (adminResponse.status !== 200) return adminResponse;

    // Step 2: Connect to the database
    await connectDB();

    // Step 3: Get all the users without the password & timestamps fields
    const users: Array<FetchedUsers> = await User.find().select("-password -createdAt -updatedAt");

    // Step 4: Remove the Admin user
    const filteredUsers: Array<FetchedUsers> = users.filter((user) => user.role !== "admin");

    // Step 5: Remove the role field from the users
    filteredUsers.forEach((user) => delete user.role);

    // Step 6: Return the users
    return NextResponse.json({ users: filteredUsers }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) console.error(error.message);
    else console.error("An unknown error occurred.");

    return NextResponse.json({ message: "An error occurred." }, { status: 500 });
  }
}
