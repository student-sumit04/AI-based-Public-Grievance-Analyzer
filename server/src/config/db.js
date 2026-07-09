import mongoose from "mongoose";

export async function connectDb() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/grievance_ai";

  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed", error.message);
    process.exit(1);
  }
}
