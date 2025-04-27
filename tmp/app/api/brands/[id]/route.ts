// Database
import connectDB from "@/db/connectDB";

// Models
import Brand from "@/models/Brand";

// Middlewares
import { adminOrBrandMiddleware } from "@/middlewares/adminOrBrand";

// Next Js
import { NextRequest, NextResponse } from "next/server";

// Types
interface bodyType {
  name: string;
  email: string;
  logo: string;
  password: string;
}
interface paramsType {
  params: { id: string };
}

// @desc    Delete brand
// @route   GET /api/brands/:id
// @access  Private
export async function DELETE(req: NextRequest, { params }: paramsType): Promise<NextResponse> {
  try {
    // Step 1: Check if the user is authorized to perform this action
    const response = await adminOrBrandMiddleware(req, { params: params });
    if (response.status !== 200) return response;

    // Step 2: Connect to the database
    await connectDB();

    // Step 3: Delete the brand
    const brandToDelete = await Brand.findByIdAndDelete(params.id);

    // Step 4: Return an appropriate response
    return NextResponse.json({ message: "Brand deleted.", brand: brandToDelete }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) console.error(error.message);
    else console.error("An unknown error occurred.");

    return NextResponse.json({ message: "An error occurred." }, { status: 500 });
  }
}

// @desc    Update brand
// @route   GET /api/brands/:id
// @access  Private
export async function PUT(req: NextRequest, { params }: paramsType): Promise<NextResponse> {
  try {
    // Step 1: Await the required information
    const brandId = params.id;
    const body: bodyType = await req.json();

    // Step 2: Check if the user is authorized to perform this action
    const response = await adminOrBrandMiddleware(req, { params: params });
    if (response.status !== 200) return response;

    // Step 3: Connect to the database
    await connectDB();

    // Step 4: Update the brand
    const updatedBrand = await Brand.findByIdAndUpdate(brandId, { ...body, updatedAt: new Date() }, { new: true });

    // Step 5: Return an appropriate response
    return NextResponse.json({ message: "Brand updated.", brand: updatedBrand }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) console.error(error.message);
    else console.error("An unknown error occurred.");

    return NextResponse.json({ message: "An error occurred." }, { status: 500 });
  }
}
