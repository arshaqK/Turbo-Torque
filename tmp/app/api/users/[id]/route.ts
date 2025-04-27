// Database
import connectDB from "@/db/connectDB";

// Models
import User from "@/models/User";

// Next Js
import { NextRequest, NextResponse } from "next/server";

// @desc    Delete user
// @route   GET /api/users/:id
// @access  Private
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  try {
    // Step 1: Check if the user themselves is making the request
    const userEmail = req.headers.get("x-user-email");
    if (!userEmail) return NextResponse.json({ message: "User not found or unauthorized." }, { status: 401 });

    // Step 2: Connect to the database
    await connectDB();

    // Step 3: Get the user to be deleted
    const userId = params.id;
    const userToDelete = await User.findById(userId);
    if (!userToDelete) return NextResponse.json({ message: "User not found." }, { status: 404 });

    // Step 4: Check if the user is authorized to perform this action
    if (userToDelete.email !== userEmail || userToDelete.role !== "admin") {
      return NextResponse.json({ message: "Not authorized." }, { status: 401 });
    }

    // Step 5: Delete the user
    await User.findByIdAndDelete(userId);

    // Step 6: Return an appropriate response
    return NextResponse.json({ message: "User deleted.", user: userToDelete }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) console.error(error.message);
    else console.error("An unknown error occurred.");

    return NextResponse.json({ message: "An error occurred." }, { status: 500 });
  }
}
