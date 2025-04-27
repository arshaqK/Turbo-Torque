import { NextResponse } from "next/server";
import connectDB from "@/db/connectDB";
import Review from "@/models/Review";

export async function GET(req: Request, { params }: { params: { renterId: string } }) {
    try {
        await connectDB();
        const reviews = await Review.find({ reviewedId: params.renterId, reviewType: "renter" }).populate("reviewerId", "name");

        if(!reviews) {
            return NextResponse.json({ message: "reviews not found" }, { status: 404 });
        }

        return NextResponse.json({ reviews }, { status: 200 });
    } 
    catch (error) {
        return NextResponse.json({ message: "Error fetching car reviews." }, { status: 500 });
    }
};