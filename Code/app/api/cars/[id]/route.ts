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

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        const car = await Car.findById(params.id);

        if(!car) {
            return NextResponse.json({ message: 'Car not found' },  { status: 404 });
        }
        return NextResponse.json(car, { status: 200 });
    }
    catch(error: unknown) {
        if (error instanceof Error) console.error(error.message);
        else console.error("An unknown error occurred.");
        
        return NextResponse.json({ message: "An error occurred." }, { status: 500 });
    }
};

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        await connectDB();
    
        // Step 1: Parse the request body
        const { ownerId, title, description, location, price, pricePerDay, images, isForSale, isForRent } = (await request.json()) as CarRequest;
    
        // Step 2: Validate required fields (allow partial updates but check for validity)
        if (title !== undefined && !title.trim()) {
            return NextResponse.json({ message: "Title cannot be empty." }, { status: 400 });
        }
        if (location !== undefined && !location.trim()) {
            return NextResponse.json({ message: "Location cannot be empty." }, { status: 400 });
        }
        if (images !== undefined && !Array.isArray(images)) {
            return NextResponse.json({ message: "Images must be an array." }, { status: 400 });
        }
  
      // Step 3: Check if the car exists
        const existingCar = await Car.findById(params.id);
        if (!existingCar) {
            return NextResponse.json({ message: "Car not found." }, { status: 404 });
        }
    
        // Step 4: Check if owner exists (only if ownerId is being updated)
        if (ownerId) {
            const ownerExists = await User.findById(ownerId);
            if (!ownerExists) {
            return NextResponse.json({ message: "Owner not found." }, { status: 404 });
            }
        }
  
        // Step 5: Update the car with validated data
        const updatedCar = await Car.findByIdAndUpdate(
            params.id,
            {
                ownerId,
                title: title?.trim() ?? existingCar.title,
                description: description?.trim() ?? existingCar.description,
                location: location?.trim() ?? existingCar.location,
                price: price ?? existingCar.price,
                pricePerDay: pricePerDay ?? existingCar.pricePerDay,
                images: images ?? existingCar.images,
                isForSale: isForSale ?? existingCar.isForSale,
                isForRent: isForRent ?? existingCar.isForRent,
            },
            { new: true, runValidators: true }
        );
    
        return NextResponse.json({ message: "Car updated successfully", car: updatedCar }, { status: 200 });
    } catch (error) {
        console.error("Error updating car:", error instanceof Error ? error.message : "Unknown error");
        return NextResponse.json({ message: "An error occurred while updating the car." }, { status: 500 });
    }
};
  
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        const deletedCar = await Car.findByIdAndDelete(params.id);

        if(!deletedCar) {
            return NextResponse.json({ message: 'Car not found' },  { status: 404 });
        }
        return NextResponse.json({ message: 'Car deleted successfully' }, { status: 200 });
    }
    catch(error: unknown) {
        if (error instanceof Error) console.error(error.message);
        else console.error("An unknown error occurred.");
        
        return NextResponse.json({ message: "An error occurred." }, { status: 500 });
    }
};