import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";

// PDF Worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export async function parseFile(file) {

  const ext = file.name.split(".").pop().toLowerCase();

  // TXT / MD
  if (ext === "txt" || ext === "md") {
    return await file.text();
  }

  // DOCX
  if (ext === "docx") {

    const arrayBuffer = await file.arrayBuffer();

    const result = await mammoth.extractRawText({
      arrayBuffer,
    });

    return result.value;
  }

  // PDF
  if (ext === "pdf") {

    const arrayBuffer = await file.arrayBuffer();

    const pdf = await pdfjsLib.getDocument({
      data: arrayBuffer,
    }).promise;

    let text = "";

    for (let page = 1; page <= pdf.numPages; page++) {

      const p = await pdf.getPage(page);

      const content = await p.getTextContent();

      text +=
        content.items
          .map((item) => item.str)
          .join(" ") + "\n\n";
    }

    return text;
  }

  throw new Error("Unsupported file type.");
}