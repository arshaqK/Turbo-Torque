import { Schema, model, models } from 'mongoose';


const RentalRequestSchema = new Schema({
    renterId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    carId: { type: Schema.Types.ObjectId, ref: "Car", required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true }, 
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalPrice: { type: Number, required: true },
    status: { 
        type: String, 
        enum: ["pending", "approved", "rejected", "cancelled", "completed"], 
        default: "pending" 
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const RentalRequest = models.RentalRequest || model("RentalRequest", RentalRequestSchema);

export default RentalRequest;