import Groq from "groq-sdk";
import { createEmbedding } from "./embeddingService.js";
import { cleanComplaintText, keywordScore } from "./textService.js";

const categories = {
  Road: ["road", "pothole", "traffic", "bridge", "accident", "street"],
  Water: ["water", "pipeline", "leakage", "drain", "sewage"],
  Electricity: ["electric", "wire", "power", "streetlight", "light", "transformer"],
  Health: ["hospital", "clinic", "medicine", "disease", "doctor", "ambulance"],
  Transport: ["bus", "metro", "transport", "ticket", "route"],
  Education: ["school", "college", "teacher", "student", "classroom"],
  Police: ["police", "crime", "theft", "harassment", "violence"],
  Sanitation: ["garbage", "waste", "cleaning", "toilet", "trash", "dustbin"]
};

const departmentByCategory = {
  Road: "Public Works Department",
  Water: "Water Supply Department",
  Electricity: "Electricity Board",
  Health: "Health Department",
  Transport: "Transport Department",
  Education: "Education Department",
  Police: "Police Department",
  Sanitation: "Sanitation Department",
  General: "General Administration"
};

const urgentWords = ["accident", "fire", "death", "danger", "school", "hospital", "wire", "collapse", "flood", "unsafe"];
const negativeWords = ["angry", "months", "ignored", "nobody", "danger", "accident", "dirty", "unsafe", "urgent", "corrupt"];
const positiveWords = ["thanks", "resolved", "good", "appreciate"];

function fallbackAnalysis(title, description, duplicateCount = 0) {
  const rawText = `${title} ${description}`;
  const cleanedText = cleanComplaintText(rawText);
  const lower = cleanedText.toLowerCase();

  const category = Object.entries(categories)
    .map(([name, words]) => ({ name, score: keywordScore(lower, words) }))
    .sort((a, b) => b.score - a.score)[0];

  const selectedCategory = category?.score > 0 ? category.name : "General";
  const urgencyScore = keywordScore(lower, urgentWords);
  const sentiment =
    keywordScore(lower, negativeWords) > keywordScore(lower, positiveWords) ? "Negative" : keywordScore(lower, positiveWords) ? "Positive" : "Neutral";
  const urgency = urgencyScore >= 2 ? "Critical" : urgencyScore === 1 ? "High" : sentiment === "Negative" ? "Medium" : "Low";
  const priority = urgency === "Critical" ? 5 : urgency === "High" ? 4 : urgency === "Medium" ? 3 : 2;
  const risk = Math.min(98, Math.round(priority * 14 + duplicateCount * 10 + (sentiment === "Negative" ? 18 : 0)));

  return {
    cleanedText,
    category: selectedCategory,
    urgency,
    department: departmentByCategory[selectedCategory],
    priority,
    sentiment,
    escalationRisk: risk,
    aiSummary: description.length > 160 ? `${description.slice(0, 157)}...` : description,
    aiExplanation: `Detected ${selectedCategory.toLowerCase()} keywords, ${sentiment.toLowerCase()} sentiment, and ${urgency.toLowerCase()} urgency.`
  };
}

async function groqAnalysis(title, description, duplicateCount) {
  if (!process.env.GROQ_API_KEY) return null;

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const prompt = `
Analyze this public grievance and return only valid JSON.
Allowed categories: Road, Water, Electricity, Health, Transport, Education, Police, Sanitation, General.
Allowed urgency: Low, Medium, High, Critical.
Allowed sentiment: Positive, Neutral, Negative.

Title: ${title}
Description: ${description}
Duplicate count: ${duplicateCount}

JSON keys: category, urgency, department, priority, sentiment, escalationRisk, aiSummary, aiExplanation.
`;

  const result = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: "You analyze civic complaints and must return strict JSON only."
      },
      {
        role: "user",
        content: prompt
      }
    ]
  });

  const text = (result.choices?.[0]?.message?.content || "").replace(/```json|```/g, "").trim();
  return JSON.parse(text);
}

export async function analyzeComplaint({ title, description, duplicateCount = 0 }) {
  const fallback = fallbackAnalysis(title, description, duplicateCount);
  const embedding = createEmbedding(fallback.cleanedText);

  try {
    const llm = await groqAnalysis(title, description, duplicateCount);
    if (!llm) return { ...fallback, embedding };
    return {
      ...fallback,
      ...llm,
      cleanedText: fallback.cleanedText,
      embedding,
      priority: Math.min(5, Math.max(1, Number(llm.priority) || fallback.priority)),
      escalationRisk: Math.min(100, Math.max(0, Number(llm.escalationRisk) || fallback.escalationRisk))
    };
  } catch (error) {
    return { ...fallback, embedding, aiExplanation: `${fallback.aiExplanation} Groq fallback used: ${error.message}` };
  }
}
