import { Schema, model, models } from "mongoose";

const UsedCarSchema = new Schema(
  {
    name: { type: String, required: true },
    images: [{ type: String, required: true }], // multiple images for carousel
    price: { type: String, required: true },
    mileage: { type: String, required: true },
    modelYear: { type: Number, required: true },
    city: { type: String, required: true },
    sellerName: { type: String, required: true },
    sellerPhone: { type: String, required: true },
    sellerComments: { type: String },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    collection: "UsedCars", // optional but clean
  }
);

const UsedCar = models.UsedCar || model("UsedCar", UsedCarSchema);
export default UsedCar;
