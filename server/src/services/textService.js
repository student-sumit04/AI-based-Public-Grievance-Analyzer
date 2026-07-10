const stopWords = new Set([
  "the",
  "is",
  "are",
  "and",
  "or",
  "a",
  "an",
  "to",
  "for",
  "of",
  "in",
  "on",
  "has",
  "have",
  "been",
  "not",
  "this",
  "that",
  "near",
  "from"
]);

export function cleanComplaintText(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word && !stopWords.has(word))
    .join(" ")
    .trim();
}

export function keywordScore(text, words) {
  return words.reduce((score, word) => (text.includes(word) ? score + 1 : score), 0);
}
