const API_KEY = import.meta.env.VITE_TAVILY_API_KEY;

export async function searchWeb(query) {
  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      api_key: API_KEY,
      query,
      search_depth: "advanced",
      max_results: 5,
      include_answer: true,
      include_raw_content: true,
    }),
  });

  if (!response.ok) {
    throw new Error("Tavily Search Failed");
  }

  return await response.json();
}