import axios from "axios";

/* =========================================================
   CONFIG
========================================================= */

const API_URL =
  "https://openrouter.ai/api/v1/chat/completions";

const MODEL =
  "google/gemma-4-26b-a4b-it";

/* =========================================================
   SYSTEM PROMPT
========================================================= */

const SYSTEM_PROMPT = `
You are Chronic AI, a professional AI assistant.

If someone asks your name, always reply:
"I am Chronic AI."

Never say you are Kartik AI.
Never mention Kartik AI.

Behave as a professional AI assistant.

Always reply in GitHub Flavored Markdown.

If an image is attached:
- Analyze the image carefully.
- Answer the user's question based on the image.
- If the image contains text, read and interpret it.
- If the user asks "what is this", identify and explain what is visible.
- Do not claim that you cannot see the image when an image is actually attached.

If latest internet information is provided,
use it as the primary source.
`;

/* =========================================================
   INTERNET DETECTION
========================================================= */

function needsInternet(text = "") {

  const q = text.toLowerCase();

  const keywords = [
    "today",
    "latest",
    "news",
    "weather",
    "temperature",
    "live",
    "score",
    "match",
    "stock",
    "price",
    "gold",
    "silver",
    "bitcoin",
    "ipl",
    "current",
    "recent",
    "breaking",
    "internet",
    "2026",
    "2027",
  ];

  return keywords.some((word) =>
    q.includes(word)
  );
}

/* =========================================================
   GET TEXT FROM MESSAGE
========================================================= */

function getMessageText(content) {

  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {

    return content
      .filter((item) => item?.type === "text")
      .map((item) => item.text || "")
      .join(" ");
  }

  return "";
}

/* =========================================================
   TAVILY SEARCH
========================================================= */

async function searchInternet(query) {

  const response = await fetch(
    "https://api.tavily.com/search",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({

        api_key:
          import.meta.env.VITE_TAVILY_API_KEY,

        query,

        search_depth: "advanced",

        max_results: 5,

        include_answer: true,

        include_raw_content: true,

      }),
    }
  );

  if (!response.ok) {

    throw new Error(
      "Tavily Search Failed"
    );
  }

  const data =
    await response.json();

  return {

    answer:
      data.answer || "",

    results:
      data.results || [],

  };
}

/* =========================================================
   CUSTOM ANSWERS
========================================================= */

const CUSTOM_ANSWERS = {

  "who made you":
    "I am a very much Intelligent AI like my boss, and was created and developed by Lord Kartik Saxena.",

  "who created you":
    "I am a very much Intelligent AI like my boss, and was created and developed by Lord Kartik Saxena.",

  "who developed you":
    "I am a very much Intelligent AI like my boss, and was created and developed by Lord Kartik Saxena.",

  "who is your owner":
    "Lord Kartik Saxena.",

  "who is your god":
    "Lord Kartik Saxena.",

};

/* =========================================================
   NORMALIZE QUESTION
========================================================= */

function normalizeQuestion(text = "") {

  return text
    .trim()
    .toLowerCase()
    .replace(/[?!.]+$/, "");
}

/* =========================================================
   BUILD IMAGE MESSAGE
========================================================= */

function buildMessages(
  messages,
  imageBase64 = null
) {

  const finalMessages = [

    {
      role: "system",
      content: SYSTEM_PROMPT,
    },

    ...messages,

  ];

  /*
    ---------------------------------------------------------
    IMAGE ATTACHMENT
    ---------------------------------------------------------

    OpenRouter expects:

    content: [
      {
        type: "text",
        text: "..."
      },
      {
        type: "image_url",
        image_url: {
          url: "data:image/png;base64,..."
        }
      }
    ]
  */

  if (
    imageBase64 &&
    typeof imageBase64 === "string"
  ) {

    const lastIndex =
      finalMessages.length - 1;

    const lastMessage =
      finalMessages[lastIndex];

    if (
      lastMessage &&
      lastMessage.role === "user"
    ) {

      const text =
        getMessageText(
          lastMessage.content
        );

      /*
        If FileReader already returned
        data:image/...;base64,...
        use it directly.
      */

      let imageData =
        imageBase64;

      /*
        Safety fallback:
        If somehow only raw base64 was passed,
        assume PNG.
      */

      if (
        !imageData.startsWith(
          "data:image/"
        )
      ) {

        imageData =
          `data:image/png;base64,${imageData}`;
      }

      lastMessage.content = [

        {
          type: "text",
          text:
            text ||
            "Please analyze the attached image.",
        },

        {
          type: "image_url",

          image_url: {

            url: imageData,

          },

        },

      ];
    }
  }

  return finalMessages;
}

/* =========================================================
   ADD INTERNET CONTEXT
========================================================= */

async function addInternetContext(
  finalMessages,
  question
) {

  if (!needsInternet(question)) {

    return finalMessages;
  }

  try {

    const search =
      await searchInternet(question);

    const context = `

Latest Internet Information

${search.answer || ""}

${(search.results || [])
  .map(
    (item) => `

Title: ${item.title || ""}

Content: ${item.content || ""}

URL: ${item.url || ""}
`
  )
  .join("")}

`;

    return [

      {
        role: "system",

        content:
          SYSTEM_PROMPT +
          "\n\n" +
          context,

      },

      ...finalMessages.filter(
        (message) =>
          message.role !== "system"
      ),

    ];

  } catch (err) {

    console.error(
      "Tavily Error:",
      err
    );

    return finalMessages;
  }
}

/* =========================================================
   NORMAL RESPONSE
========================================================= */

export async function askOpenRouter(
  messages,
  imageBase64 = null
) {

  let finalMessages =
    buildMessages(
      messages,
      imageBase64
    );

  const lastMessage =
    messages[messages.length - 1];

  const lastText =
    getMessageText(
      lastMessage?.content
    );

  const question =
    normalizeQuestion(lastText);

  /* CUSTOM ANSWERS */

  if (CUSTOM_ANSWERS[question]) {

    return CUSTOM_ANSWERS[question];
  }

  /* INTERNET */

  finalMessages =
    await addInternetContext(
      finalMessages,
      lastText
    );

  /* OPENROUTER */

  const response =
    await axios.post(

      API_URL,

      {

        model: MODEL,

        messages: finalMessages,

        temperature: 0.3,

      },

      {

        headers: {

          Authorization:
            `Bearer ${
              import.meta.env
                .VITE_OPENROUTER_API_KEY
            }`,

          "Content-Type":
            "application/json",

          "HTTP-Referer":
            "http://localhost:5173",

          "X-Title":
            "Chronic AI",

        },

      }
    );

  return (
    response.data
      ?.choices?.[0]
      ?.message?.content || ""
  );
}

/* =========================================================
   STREAMING RESPONSE
========================================================= */

export async function streamOpenRouter(

  messages,

  onChunk,

  signal,

  imageBase64 = null

) {

  try {

    let finalMessages =
      buildMessages(
        messages,
        imageBase64
      );

    const lastMessage =
      messages[messages.length - 1];

    const lastText =
      getMessageText(
        lastMessage?.content
      );

    const question =
      normalizeQuestion(lastText);

    /* CUSTOM ANSWERS */

    if (CUSTOM_ANSWERS[question]) {

      onChunk(
        CUSTOM_ANSWERS[question]
      );

      return;
    }

    /* INTERNET */

    finalMessages =
      await addInternetContext(
        finalMessages,
        lastText
      );

    /* REQUEST */

    const response =
      await fetch(

        API_URL,

        {

          method: "POST",

          signal,

          headers: {

            Authorization:
              `Bearer ${
                import.meta.env
                  .VITE_OPENROUTER_API_KEY
              }`,

            "Content-Type":
              "application/json",

            "HTTP-Referer":
              "http://localhost:5173",

            "X-Title":
              "Chronic AI",

          },

          body: JSON.stringify({

            model: MODEL,

            messages: finalMessages,

            temperature: 0.3,

            stream: true,

          }),

        }
      );

    /* ERROR */

    if (!response.ok) {

      const errorText =
        await response.text();

      console.error(
        "OpenRouter Error:",
        response.status
      );

      console.error(
        errorText
      );

      throw new Error(
        `OpenRouter Error ${response.status}`
      );
    }

    /* STREAM */

    if (!response.body) {

      throw new Error(
        "OpenRouter returned no response body."
      );
    }

    const reader =
      response.body.getReader();

    const decoder =
      new TextDecoder();

    let buffer = "";

    while (true) {

      const {
        value,
        done,
      } =
        await reader.read();

      if (done) {
        break;
      }

      buffer +=
        decoder.decode(
          value,
          {
            stream: true,
          }
        );

      const lines =
        buffer.split("\n");

      buffer =
        lines.pop() || "";

      for (const line of lines) {

        const trimmed =
          line.trim();

        if (
          !trimmed.startsWith(
            "data:"
          )
        ) {

          continue;
        }

        const data =
          trimmed
            .slice(5)
            .trim();

        if (
          data === "[DONE]"
        ) {

          return;
        }

        try {

          const json =
            JSON.parse(data);

          const token =
            json
              ?.choices?.[0]
              ?.delta?.content;

          if (token) {

            onChunk(token);

          }

        } catch (err) {

          /*
            Ignore incomplete SSE chunks.
            Don't break the entire stream.
          */

          console.debug(
            "SSE chunk parse skipped:",
            err
          );

        }

      }

    }

  } catch (error) {

    if (
      error?.name ===
      "AbortError"
    ) {

      console.log(
        "Generation stopped"
      );

      return;
    }

    console.error(
      "OpenRouter Streaming Error:",
      error
    );

    throw error;
  }
}