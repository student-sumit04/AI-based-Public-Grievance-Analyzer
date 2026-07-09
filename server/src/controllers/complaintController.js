import Complaint from "../models/Complaint.js";
import ComplaintLog from "../models/ComplaintLog.js";
import { createAnalyzedComplaint } from "../services/complaintService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { emitToRoom } from "../services/socketService.js";

function complaintFilter(user) {
  if (user.role === "Citizen") return { citizen: user._id };
  if (user.role === "Officer") return { department: user.department || "__none__" };
  return {};
}

export const createComplaint = asyncHandler(async (req, res) => {
  const complaint = await createAnalyzedComplaint({ body: req.body, files: req.files, user: req.user });
  await ComplaintLog.create({ complaintId: complaint._id, action: "Complaint submitted", officer: req.user._id });

  emitToRoom(`department:${complaint.department}`, "complaint:new", complaint);
  emitToRoom(`user:${req.user._id}`, "complaint:updated", complaint);

  res.status(201).json({ complaint });
});

export const getComplaints = asyncHandler(async (req, res) => {
  const complaints = await Complaint.find(complaintFilter(req.user))
    .populate("citizen", "name email")
    .populate("assignedOfficer", "name email")
    .sort({ createdAt: -1 });

  res.json({ complaints });
});

export const getComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findOne({ _id: req.params.id, ...complaintFilter(req.user) })
    .populate("citizen", "name email")
    .populate("assignedOfficer", "name email");
  const logs = await ComplaintLog.find({ complaintId: req.params.id }).populate("officer", "name role").sort({ timestamp: 1 });

  if (!complaint) return res.status(404).json({ message: "Complaint not found" });
  res.json({ complaint, logs });
});

export const updateStatus = asyncHandler(async (req, res) => {
  const { status, remarks, department } = req.body;
  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) return res.status(404).json({ message: "Complaint not found" });
  if (req.user.role === "Officer" && complaint.department !== req.user.department) {
    return res.status(403).json({ message: "Complaint belongs to another department" });
  }

  if (department && req.user.role !== "Admin") {
    return res.status(403).json({ message: "Only admins can reassign a complaint to another department" });
  }

  const previousDepartment = complaint.department;
  const departmentChanged = Boolean(department && department !== complaint.department);

  complaint.status = status || complaint.status;
  complaint.remarks = remarks ?? complaint.remarks;
  if (departmentChanged) {
    complaint.department = department;
    if (!status) complaint.status = "Assigned";
  }
  complaint.assignedOfficer = complaint.assignedOfficer || req.user._id;
  await complaint.save();

  const logAction = departmentChanged
    ? `Complaint reassigned from ${previousDepartment} to ${complaint.department}`
    : `Status updated to ${complaint.status}`;

  await ComplaintLog.create({
    complaintId: complaint._id,
    action: logAction,
    officer: req.user._id,
    note: complaint.remarks
  });

  if (departmentChanged) {
    emitToRoom(`department:${previousDepartment}`, "complaint:updated", complaint);
  }
  emitToRoom(`department:${complaint.department}`, "complaint:updated", complaint);
  emitToRoom(`user:${complaint.citizen}`, "complaint:updated", complaint);

  res.json({ complaint });
});
