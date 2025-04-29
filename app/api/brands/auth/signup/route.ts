// Database
import connectDB from "@/db/connectDB";

// Models
import Brand from "@/models/Brand";

// Next.js
import { NextResponse } from "next/server";

// Dependencies
import bcrypt from "bcryptjs";

// Types
import { BrandType } from "@/types";

interface BrandRequest {
  name: string;
  email: string;
  logo: string;
  password: string;
}

interface ErrorResponse {
  message: string;
}

// @desc    Create new brand
// @route   POST /api/brands/auth/signup
// @access  Public
export async function POST(request: Request): Promise<NextResponse<{ message: string; brand?: BrandType } | ErrorResponse>> {
  try {
    // Step 1: Get the provided brand information
    const { name, email, logo, password } = (await request.json()) as BrandRequest;

    // Step 2: Check if all the required fields are present
    if (!name?.trim() || !email?.trim() || !logo?.trim() || !password?.trim()) {
      return NextResponse.json({ message: "Please fill in all the required fields." }, { status: 400 });
    }

    // Step 3: Connect to the database
    await connectDB();

    // Step 4: Check if a brand with the same email already exists
    const existingBrand = await Brand.findOne({ email: email.toLowerCase() });

    if (existingBrand) {
      return NextResponse.json({ message: `Existing email.` }, { status: 409 });
    }

    // Step 5: Brand does not exist - hash their password (for security)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Step 6: Create a new brand
    const newBrand = await Brand.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      logo: logo.trim(),
      password: hashedPassword,
    });

    // Step 7: Return the new brand
    const brandResponse: BrandType = {
      _id: newBrand._id.toString(),
      name: newBrand.name,
      email: newBrand.email,
      logo: newBrand.logo,
      isVerified: newBrand.isVerified,
      cars: newBrand.cars,
    };

    // Step 8: Return the response
    return NextResponse.json({ message: "Brand created successfully", brand: brandResponse }, { status: 201 });
  } catch (error) {
    console.error("Error in brand signup:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ message: "An error occurred during signup." }, { status: 500 });
  }
}
