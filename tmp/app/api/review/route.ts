import { NextResponse } from "next/server";
import connectDB from "@/db/connectDB";
import Review from "@/models/Review";
import RentalRequest from "@/models/RentalRequest";

//posting a review
export async function POST(req: Request) {
    try {
        await connectDB();

        const { reviewerId, reviewedId, carId, rentalId, rating, comment, reviewType } = await req.json();

        if (!reviewerId || !reviewedId || !rentalId || !rating || !reviewType) {
            return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
        }

        if (rating < 1 || rating > 5) {
            return NextResponse.json({ message: "Rating must be between 1 and 5." }, { status: 400 });
        }

        const rental = await RentalRequest.findById(rentalId);
        if (!rental) {
            return NextResponse.json({ message: "Rental not found." }, { status: 404 });
        }

        if (reviewType === "car" && reviewerId !== rental.renterId.toString()) {
            return NextResponse.json({ message: "Only renters can review cars." }, { status: 403 });
        }

        if (reviewType === "renter" && reviewerId !== rental.ownerId.toString()) {
            return NextResponse.json({ message: "Only owners can review renters." }, { status: 403 });
        }

        const newReview = await Review.create({
            reviewerId,
            reviewedId,
            carId,
            rentalId,
            rating,
            comment,
            reviewType,
        });

        return NextResponse.json({ message: "Review added successfully", review: newReview }, { status: 201 });
    } 
    catch (error) {
        console.error("Error adding review:", error);
        return NextResponse.json({ message: "Error adding review." }, { status: 500 });
    }
};
