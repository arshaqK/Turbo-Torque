import { NextResponse } from 'next/server';
import connectDB from '@/db/connectDB';
import Car from '@/models/Car';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();

    const { availability } = await request.json();

    const updatedCar = await Car.findByIdAndUpdate(
      params.id,
      { availability },
      { new: true }
    );

    if (!updatedCar) {
      return NextResponse.json({ message: 'Car not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Car availability updated', updatedCar }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error updating car availability' }, { status: 500 });
  }
}
