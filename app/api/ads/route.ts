// Database
import connectDB from "@/db/connectDB";

import UsedCar from "@/models/Ad"; // the model we just made
import { NextRequest, NextResponse } from "next/server";

// POST /api/used-cars
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    const { name, images, price, mileage, modelYear, city, sellerName, sellerPhone, sellerComments } = body;

    // Basic validation
    if (!name || !images || !Array.isArray(images) || images.length === 0 || !price || !mileage || !modelYear || !city || !sellerName || !sellerPhone) {
      return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
    }

    const newCar = await UsedCar.create({ name, images, price, mileage, modelYear, city, sellerName, sellerPhone, sellerComments });
    return NextResponse.json({ message: "Car ad created successfully.", car: newCar }, { status: 201 });
  } catch (error) {
    console.error("[POST Used Car]", error);
    return NextResponse.json({ message: "Failed to create car ad.", error }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const cars = await UsedCar.find();
    return NextResponse.json({ cars });
  } catch (error: unknown) {
    if (error instanceof Error) console.error(error.message);
    else console.error("An unknown error occurred.");

    return NextResponse.json({ message: "An error occurred." }, { status: 500 });
  }
}
