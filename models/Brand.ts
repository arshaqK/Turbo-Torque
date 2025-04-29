import { Schema, model, models } from "mongoose";
import type { NewCarType } from "@/types";

const BrandSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  logo: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  cars: { type: Array<NewCarType>, default: [] },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Brand = models.Brand || model("Brand", BrandSchema, "Brands");
export default Brand;
