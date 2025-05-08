import { NextResponse } from "next/server";
import connectDB from "@/db/connectDB";
import RentalRequest from "@/models/RentalRequest";

// GET /api/rentals/received/:id → where :id is the owner's ID
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();

    const rentals = await RentalRequest.find({ ownerId: params.id })
      .populate("renterId", "name email phoneNumber")
      .populate("carId", "title location images");

    return NextResponse.json({ rentals }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error fetching rental requests by owner" }, { status: 500 });
  }
}
