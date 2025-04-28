import mongoose, { ConnectOptions } from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI as string, {} as ConnectOptions);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    if (error instanceof Error) console.error("Database connection error:", error.message);
    else console.error("An unknown error occurred.");

    throw new Error("Failed to connect to the database.");
  }
};

export default connectDB;
