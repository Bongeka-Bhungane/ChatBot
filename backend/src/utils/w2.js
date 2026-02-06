import fs from "node:fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

export default async function extractText(filePath) {
  try {
    const dataBuffer = new Uint8Array(fs.readFileSync(filePath));

    // Load the PDF
    const loadingTask = pdfjsLib.getDocument({
      data: dataBuffer,
      useSystemFonts: true,
      disableFontFace: true, // Better stability for Node environment
    });

    const pdf = await loadingTask.promise;
    let fullText = "";

    // Loop through pages
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();

      // Concatenate text items
      const pageText = textContent.items.map((item) => item.str).join(" ");
      fullText += `${pageText}`;
    }

    console.log("--- PDF Text Content ---");
    fs.writeFileSync("extracted_text.txt", fullText);
    console.log(fullText);
  } catch (err) {
    console.error("Error extracting text:", err);
  }
}

