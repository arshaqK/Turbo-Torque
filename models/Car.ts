import { Schema, model, models } from 'mongoose';

const CarSchema = new Schema({
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true }, 
    title: { type: String, required: true },
    description: { type: String },
    location: { type: String, required: true },
    price: { type: Number },
    pricePerDay: { type: Number },
    availability: { type: Boolean, default: false },
    images: { type: [String], required: true },
    isForSale: { type: Boolean, default: false },
    isForRent: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const Car = models.Car || model("Car", CarSchema);

export default Car;