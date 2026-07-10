import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    departmentName: { type: String, required: true, unique: true, trim: true },
    headOfficer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    email: { type: String, required: true, trim: true },
    location: { type: String, default: "" },
    serviceKeywords: [{ type: String }]
  },
  { timestamps: true }
);

export default mongoose.model("Department", departmentSchema);
