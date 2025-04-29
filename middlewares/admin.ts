// Models
import User from "@/models/User";

// Next Js
import { NextResponse, NextRequest } from "next/server";

export async function adminMiddleware(req: NextRequest) {
  try {
    // Step 1: Get the user email from request headers
    const userEmail = req.headers.get("x-user-email");
    if (!userEmail) return NextResponse.json({ message: "User not found or unauthorized." }, { status: 401 });

    // Step 2: Get the user
    const user = await User.findOne({ email: userEmail });
    if (!user) return NextResponse.json({ message: "User not found or unauthorized." }, { status: 401 });

    // Step 3: Check if the user is an admin
    if (user.role !== "admin") return NextResponse.json({ message: "User not found or unauthorized." }, { status: 401 });

    // Allow access to the route
    return NextResponse.next();
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}
