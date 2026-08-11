const searchKeywords = [
  "latest",
  "today",
  "news",
  "current",
  "price",
  "weather",
  "score",
  "stock",
  "share",
  "live",
  "breaking",
];

export function isSearchQuery(prompt) {
  const text = prompt.toLowerCase();

  return searchKeywords.some((word) => text.includes(word));
}