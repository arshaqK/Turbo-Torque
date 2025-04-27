// Database
import connectDB from "@/db/connectDB";

// Models
import User from "@/models/User";
import Brand from "@/models/Brand";

// Next Js
import { NextResponse, NextRequest } from "next/server";

export async function adminOrBrandMiddleware(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Step 1: Check if the brand themselves is making the request
    const userEmail = req.headers.get("x-user-email");
    if (!userEmail) return NextResponse.json({ message: "User not found or unauthorized." }, { status: 401 });

    // Step 2: Connect to the database
    await connectDB();

    // Step 3: Get the brand to be deleted
    const brandId = params.id;
    const brandToDelete = await Brand.findById(brandId);
    if (!brandToDelete) return NextResponse.json({ message: "Brand not found." }, { status: 404 });

    // Step 4: Check if the user is authorized to perform this action
    if (brandToDelete.email !== userEmail) {
      // Check if the user is an admin
      const user = await User.findOne({ email: userEmail });

      if (!user || user.role !== "admin") {
        return NextResponse.json({ message: "Not authorized." }, { status: 401 });
      }
    }

    // Allow access to the route
    return NextResponse.next();
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}
