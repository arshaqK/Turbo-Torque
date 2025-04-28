// Database
import connectDB from "@/db/connectDB";

// Models
import Brand from "@/models/Brand";

// Middlewares
import { adminMiddleware } from "@/middlewares/admin";

// Next Js
import { NextResponse, NextRequest } from "next/server";

// Types
interface FetchedBrands {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role?: string;
}

// @desc    Get all brands
// @route   GET /api/brands
// @access  Private
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: Check if the user is an admin
    const adminResponse = await adminMiddleware(req);
    if (adminResponse.status !== 200) return adminResponse;

    // Step 2: Connect to the database
    await connectDB();

    // Step 3: Get all the brands without the password & timestamps fields
    const brands: Array<FetchedBrands> = await Brand.find().select("-password -createdAt -updatedAt");

    // Step 4: Return the brands
    return NextResponse.json({ brands }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) console.error(error.message);
    else console.error("An unknown error occurred.");

    return NextResponse.json({ message: "An error occurred." }, { status: 500 });
  }
}
