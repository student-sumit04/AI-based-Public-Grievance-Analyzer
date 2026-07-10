import Complaint from "../models/Complaint.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getDashboard = asyncHandler(async (req, res) => {
  const baseFilter = req.user.role === "Officer" ? { department: req.user.department } : req.user.role === "Citizen" ? { citizen: req.user._id } : {};

  const [status, category, sentiment, urgency, recent, totals] = await Promise.all([
    Complaint.aggregate([{ $match: baseFilter }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
    Complaint.aggregate([{ $match: baseFilter }, { $group: { _id: "$category", count: { $sum: 1 } } }]),
    Complaint.aggregate([{ $match: baseFilter }, { $group: { _id: "$sentiment", count: { $sum: 1 } } }]),
    Complaint.aggregate([{ $match: baseFilter }, { $group: { _id: "$urgency", count: { $sum: 1 } } }]),
    Complaint.find(baseFilter).sort({ createdAt: -1 }).limit(8).select("title status urgency department escalationRisk createdAt"),
    Complaint.aggregate([
      { $match: baseFilter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          avgRisk: { $avg: "$escalationRisk" },
          highRisk: { $sum: { $cond: [{ $gte: ["$escalationRisk", 70] }, 1, 0] } }
        }
      }
    ])
  ]);

  res.json({
    totals: totals[0] || { total: 0, avgRisk: 0, highRisk: 0 },
    charts: { status, category, sentiment, urgency },
    recent
  });
});
