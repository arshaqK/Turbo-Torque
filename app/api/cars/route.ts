// Database
import connectDB from "@/db/connectDB";

// Models
import Car from "@/models/Car";
import User from "@/models/User";

// Next.js
import { NextResponse } from "next/server";

// Interfaces
interface CarRequest {
    ownerId: string;
    title: string;
    description?: string;
    location: string;
    price?: number;
    pricePerDay?: number;
    images: string[];
    isForSale?: boolean;
    isForRent?: boolean;
};

export async function POST(request: Request): Promise<NextResponse<{ message: string; car?: object }>> {
    try {
        // Step 1: Parse the request body
        const { ownerId, title, description, location, price, pricePerDay, images, isForSale, isForRent } = (await request.json()) as CarRequest;

        // Step 2: Validate required fields
        if (!ownerId || !title.trim() || !location.trim() || !images?.length) {
            return NextResponse.json({ message: "Please provide all required fields." }, { status: 400 });
        }

        // Step 3: Connect to the database
        await connectDB();

        // Step 4: Check if the owner exists
        const owner = await User.findById(ownerId);
        if (!owner) {
            return NextResponse.json({ message: "Owner not found." }, { status: 404 });
        }

        // Step 5: Create the car listing
        const newCar = await Car.create({
            ownerId,
            title: title.trim(),
            description: description?.trim() || "",
            location: location.trim(),
            price: price || undefined,
            pricePerDay: pricePerDay || undefined,
            images,
            isForSale: !!isForSale,
            isForRent: !!isForRent,
        });

        return NextResponse.json({ message: "Car listed successfully", car: newCar }, { status: 201 });
    } 
    catch (error) {
        console.error("Error creating car:", error instanceof Error ? error.message : "Unknown error");
        return NextResponse.json({ message: "An error occurred while listing the car." }, { status: 500 });
    }
};

export async function GET() {
    try {
        await connectDB();
        const cars = await Car.find();
        return NextResponse.json({ cars });
    }
    catch(error: unknown) {
        if (error instanceof Error) console.error(error.message);
        else console.error("An unknown error occurred.");
        
        return NextResponse.json({ message: "An error occurred." }, { status: 500 });
    }
};
