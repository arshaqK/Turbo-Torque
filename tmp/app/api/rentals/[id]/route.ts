import { NextResponse } from "next/server";
import connectDB from "@/db/connectDB";
import RentalRequest from "@/models/RentalRequest";
import Car from "@/models/Car";
import User from "@/models/User";

//route to get specific rental requests
export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        const rentals = await RentalRequest.findById(params.id)
            .populate("renterId", "name email phoneNumber") // Fetch only name, email, and phoneNumber
            .populate("ownerId", "name email phoneNumber") // Fetch only name, email, and phoneNumber
            .populate("carId"); // Fetch full car details
        return NextResponse.json({ rentals }, { status: 200 });
    } 
    catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Error fetching rental requests" }, { status: 500 });
    }
};

//route to update rental request status
//here need to make sure that user who updates request is the 
//actual owner of the car in question
export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        await connectDB();

        // Parse request body
        const { status } = await request.json();
        if (!["pending", "approved", "rejected", "cancelled", "completed"].includes(status)) {
            return NextResponse.json({ message: "Invalid status" }, { status: 400 });
        }

        // Update rental request
        const updatedRental = await RentalRequest.findByIdAndUpdate(
            params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!updatedRental) return NextResponse.json({ message: "Rental request not found" }, { status: 404 });

        return NextResponse.json({ message: "Rental status updated", updatedRental }, { status: 200 });
    } 
    catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Error updating rental request" }, { status: 500 });
    }
};


//route to delete rental request
//here first need to verify that user requesting deletion
//is the same one who made the request
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        const deletedRental = await RentalRequest.findByIdAndDelete(params.id);

        if (!deletedRental) return NextResponse.json({ message: "Rental request not found" }, { status: 404 });

        return NextResponse.json({ message: "Rental request deleted" }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Error deleting rental request" }, { status: 500 });
    }
};

