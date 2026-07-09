import { analyzeComplaint } from "../services/aiService.js";
import { findDuplicateCandidates } from "../services/complaintService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const classify = asyncHandler(async (req, res) => {
  const analysis = await analyzeComplaint(req.body);
  res.json({ analysis });
});

export const summarize = asyncHandler(async (req, res) => {
  const analysis = await analyzeComplaint(req.body);
  res.json({ summary: analysis.aiSummary, explanation: analysis.aiExplanation });
});

export const similarity = asyncHandler(async (req, res) => {
  const candidates = await findDuplicateCandidates(req.body.title, req.body.description);
  res.json({ candidates });
});
