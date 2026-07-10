import mongoose from "mongoose";

const duplicateSchema = new mongoose.Schema(
  {
    complaintId: { type: mongoose.Schema.Types.ObjectId, ref: "Complaint" },
    title: String,
    similarity: Number
  },
  { _id: false }
);

const complaintSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    cleanedText: { type: String, default: "" },
    category: { type: String, default: "General" },
    urgency: { type: String, enum: ["Low", "Medium", "High", "Critical"], default: "Medium" },
    department: { type: String, default: "General Administration" },
    status: {
      type: String,
      enum: ["Submitted", "Under Review", "Assigned", "In Progress", "Resolved", "Rejected"],
      default: "Submitted"
    },
    priority: { type: Number, min: 1, max: 5, default: 3 },
    sentiment: { type: String, enum: ["Positive", "Neutral", "Negative"], default: "Neutral" },
    escalationRisk: { type: Number, min: 0, max: 100, default: 30 },
    aiSummary: { type: String, default: "" },
    aiExplanation: { type: String, default: "" },
    duplicateCandidates: [duplicateSchema],
    embedding: [{ type: Number }],
    attachments: [{ type: String }],
    citizen: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedOfficer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    remarks: { type: String, default: "" },
    location: { type: String, default: "" }
  },
  { timestamps: true }
);

complaintSchema.index({ status: 1, department: 1, urgency: 1 });
complaintSchema.index({ title: "text", description: "text", cleanedText: "text" });

export default mongoose.model("Complaint", complaintSchema);
