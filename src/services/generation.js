const OPENROUTER_API_URL =
  "https://openrouter.ai/api/v1/chat/completions";

const TEXT_MODEL =
  "google/gemma-4-26b-a4b-it";

const IMAGE_MODEL =
  "google/gemini-2.5-flash-image";

function getApiKey() {
  const key =
    import.meta.env.VITE_OPENROUTER_API_KEY;

  if (!key) {
    throw new Error(
      "VITE_OPENROUTER_API_KEY is missing from .env"
    );
  }

  return key;
}

/* =====================================================
   GENERATE IMAGE
===================================================== */

export async function generateImage(prompt) {
  const cleanPrompt = String(prompt || "").trim();

  if (!cleanPrompt) {
    throw new Error("Image prompt is empty.");
  }

  const response = await fetch(
    OPENROUTER_API_URL,
    {
      method: "POST",

      headers: {
        Authorization: `Bearer ${getApiKey()}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-Title": "Chronic AI",
      },

      body: JSON.stringify({
        model: IMAGE_MODEL,

        messages: [
          {
            role: "user",
            content: cleanPrompt,
          },
        ],

        modalities: ["text", "image"],
      }),
    }
  );

  if (!response.ok) {
    const errorText =
      await response.text();

    console.error(
      "Image generation error:",
      errorText
    );

    throw new Error(
      `Image generation failed (${response.status})`
    );
  }

  const data =
    await response.json();

  const message =
    data?.choices?.[0]?.message;

  /*
   * OpenRouter/image models can return
   * generated images in message.images.
   */

  const images =
    message?.images || [];

  if (!images.length) {
    throw new Error(
      "The image model did not return an image."
    );
  }

  const firstImage =
    images[0];

  const imageUrl =
    firstImage?.image_url?.url ||
    firstImage?.url ||
    null;

  if (!imageUrl) {
    throw new Error(
      "Generated image URL was not returned."
    );
  }

  return {
    type: "image",
    url: imageUrl,
    prompt: cleanPrompt,
  };
}


/* =====================================================
   GENERATE TEXT / FILE CONTENT
===================================================== */

export async function generateFileContent(
  prompt,
  format = "txt"
) {
  const cleanPrompt =
    String(prompt || "").trim();

  if (!cleanPrompt) {
    throw new Error(
      "File generation prompt is empty."
    );
  }

  const response = await fetch(
    OPENROUTER_API_URL,
    {
      method: "POST",

      headers: {
        Authorization: `Bearer ${getApiKey()}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-Title": "Chronic AI",
      },

      body: JSON.stringify({
        model: TEXT_MODEL,

        messages: [
          {
            role: "system",
            content: `
You are Chronic AI's file generation assistant.

Generate clean, useful content based on the user's request.

Requested output format:
${format}

Do not add unnecessary explanations outside the requested content.
`,
          },

          {
            role: "user",
            content: cleanPrompt,
          },
        ],

        temperature: 0.3,
      }),
    }
  );

  if (!response.ok) {
    const errorText =
      await response.text();

    console.error(
      "File generation error:",
      errorText
    );

    throw new Error(
      `File generation failed (${response.status})`
    );
  }

  const data =
    await response.json();

  const content =
    data?.choices?.[0]?.message?.content || "";

  if (!content.trim()) {
    throw new Error(
      "No file content was generated."
    );
  }

  return {
    type: "file",
    content,
    format,
    prompt: cleanPrompt,
  };
}


/* =====================================================
   DOWNLOAD GENERATED FILE
===================================================== */

export function downloadGeneratedFile(
  content,
  filename = "chronic-ai-file.txt",
  mimeType = "text/plain"
) {
  const blob =
    new Blob(
      [content],
      {
        type: mimeType,
      }
    );

  const url =
    URL.createObjectURL(blob);

  const anchor =
    document.createElement("a");

  anchor.href = url;
  anchor.download = filename;

  document.body.appendChild(anchor);

  anchor.click();

  anchor.remove();

  URL.revokeObjectURL(url);
}


/* =====================================================
   DOWNLOAD GENERATED IMAGE
===================================================== */

export async function downloadGeneratedImage(
  imageUrl,
  filename = "chronic-ai-image.png"
) {
  if (!imageUrl) return;

  const response =
    await fetch(imageUrl);

  const blob =
    await response.blob();

  const url =
    URL.createObjectURL(blob);

  const anchor =
    document.createElement("a");

  anchor.href = url;
  anchor.download = filename;

  document.body.appendChild(anchor);

  anchor.click();

  anchor.remove();

  URL.revokeObjectURL(url);
}