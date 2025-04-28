import { NextResponse } from "next/server";
import connectDB from "@/db/connectDB";
import RentalRequest from "@/models/RentalRequest";
import Car from "@/models/Car";
import User from "@/models/User";

//route to post rental request
export async function POST(request: Request) {
    try {
        await connectDB();

        const { renterId, carId, startDate, endDate, totalPrice } = await request.json();

        if (!renterId || !carId || !startDate || !endDate || !totalPrice) {
            return NextResponse.json({ message: "All fields are required" }, { status: 400 });
        }

        // Ensure startDate and endDate are valid dates
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
            return NextResponse.json({ message: "Invalid date range" }, { status: 400 });
        }

        // Check if the car is available for rent
        const car = await Car.findOne({ _id: carId, isForRent: true });
        if (!car) {
            return NextResponse.json({ message: "Car not available for rent" }, { status: 404 });
        }

        // Check for overlapping approved rental requests
        const overlappingRental = await RentalRequest.findOne({
            carId,
            status: "approved",
            $or: [
                { startDate: { $lt: endDate }, endDate: { $gt: startDate } }, // Start date falls within an existing rental period
                { startDate: { $lt: endDate }, endDate: { $gt: startDate } }, // End date falls within an existing rental period
                { startDate: { $gte: startDate }, endDate: { $lte: endDate } }, // Existing rental is fully inside the requested period
            ],
        });

        if (overlappingRental) {
            return NextResponse.json({ message: "Car is already rented during the selected dates" }, { status: 400 });
        }

        // Fetch the renter and check if they exist
        const renter = await User.findById(renterId);
        if (!renter) {
            return NextResponse.json({ message: "Renter not found" }, { status: 404 });
        }

        // Create the rental request
        const rentalRequest = await RentalRequest.create({
            renterId,
            carId,
            ownerId: car.ownerId,
            startDate,
            endDate,
            totalPrice,
            status: "pending",
        });

        return NextResponse.json({ message: "Rental request created", rentalRequest }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Error creating rental request" }, { status: 500 });
    }
};

//route to get all rental cars
export async function GET() {
    try {
        await connectDB();
        const car = await Car.find({ isForRent: true });
        return NextResponse.json({ car }, { status: 200 });
    } 
    catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Error fetching rental requests" }, { status: 500 });
    }
}
