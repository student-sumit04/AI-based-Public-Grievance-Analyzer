import Complaint from "../models/Complaint.js";
import { analyzeComplaint } from "./aiService.js";
import { cosineSimilarity, createEmbedding } from "./embeddingService.js";
import { cleanComplaintText } from "./textService.js";

export async function findDuplicateCandidates(title, description) {
  const cleanedText = cleanComplaintText(`${title} ${description}`);
  const embedding = createEmbedding(cleanedText);
  const recentComplaints = await Complaint.find({ embedding: { $exists: true, $ne: [] } })
    .sort({ createdAt: -1 })
    .limit(300)
    .select("title embedding");

  return recentComplaints
    .map((complaint) => ({
      complaintId: complaint._id,
      title: complaint.title,
      similarity: Number(cosineSimilarity(embedding, complaint.embedding).toFixed(3))
    }))
    .filter((candidate) => candidate.similarity >= 0.72)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5);
}

export async function createAnalyzedComplaint({ body, files, user }) {
  const duplicateCandidates = await findDuplicateCandidates(body.title, body.description);
  const ai = await analyzeComplaint({
    title: body.title,
    description: body.description,
    duplicateCount: duplicateCandidates.length
  });

  return Complaint.create({
    title: body.title,
    description: body.description,
    location: body.location || "",
    citizen: user._id,
    attachments: files?.map((file) => file.originalname) || [],
    duplicateCandidates,
    ...ai
  });
}
