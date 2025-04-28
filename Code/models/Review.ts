import { Schema, model, models } from 'mongoose';

const ReviewSchema = new Schema({
    reviewerId: { type: Schema.Types.ObjectId, ref: "User", required: true }, // The person writing the review
    reviewedId: { type: Schema.Types.ObjectId, ref: "User", required: true }, // The owner/renter being reviewed
    carId: { type: Schema.Types.ObjectId, ref: "Car", required: false }, // Only needed for car reviews
    rentalId: { type: Schema.Types.ObjectId, ref: "RentalRequest", required: true }, // Ensures a review is tied to a rental
    rating: { type: Number, required: true, min: 1, max: 5 }, // Rating (1-5 stars)
    comment: { type: String, required: false }, // Optional comment
    reviewType: { type: String, enum: ["car", "renter"], required: true }, // Defines the type of review
});

const Review = models.Review || model("Review", ReviewSchema);

export default Review;