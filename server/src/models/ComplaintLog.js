import mongoose from "mongoose";

const complaintLogSchema = new mongoose.Schema(
  {
    complaintId: { type: mongoose.Schema.Types.ObjectId, ref: "Complaint", required: true },
    action: { type: String, required: true },
    officer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    timestamp: { type: Date, default: Date.now },
    note: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.model("ComplaintLog", complaintLogSchema);
