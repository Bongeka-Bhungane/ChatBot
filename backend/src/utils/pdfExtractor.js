const fs = require('fs');
const path = require('path');

// Dynamic import for pdfjs-dist (ES module)
let pdfjsLib;

/**
 * Initialize pdfjs-dist
 */
const initializePDFJS = async () => {
  if (!pdfjsLib) {
    try {
      // Import pdfjs-dist legacy build for Node.js
      const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
      pdfjsLib = pdfjs.default || pdfjs;
      
      // Set worker source for legacy build
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/legacy/build/pdf.worker.mjs';
      
      console.log('✅ PDF.js legacy build initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize PDF.js:', error.message);
      throw error;
    }
  }
  return pdfjsLib;
};

/**
 * Extract text from a PDF file using pdfjs-dist
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<string>} - Extracted text
 */
const extractText = async (filePath) => {
  try {
    console.log('📄 Extracting text from PDF:', filePath);
    
    // Initialize PDF.js
    const pdfjs = await initializePDFJS();
    
    // Read PDF file as Uint8Array
    const dataBuffer = fs.readFileSync(filePath);
    const data = new Uint8Array(dataBuffer);
    
    // Load the PDF document
    const loadingTask = pdfjs.getDocument({
      data: data,
      useSystemFonts: true,
      disableFontFace: true, // Better stability for Node environment
    });

    const pdf = await loadingTask.promise;
    console.log(`📄 PDF loaded: ${pdf.numPages} pages`);

    let fullText = '';

    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Extract and clean text from the page
      const pageText = textContent.items
        .map(item => item.str)
        .join(' ')
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
      
      if (pageText) {
        fullText += `\n--- Page ${pageNum} ---\n${pageText}\n`;
      }
    }

    const filename = path.basename(filePath);
    const result = `[PDF Content from ${filename}]\n${fullText}`;
    
    console.log(`✅ Successfully extracted ${fullText.length} characters from ${filename}`);
    return result;
    
  } catch (error) {
    console.error('❌ Error extracting PDF text:', error.message);
    
    // Fallback to basic file info if extraction fails
    const filename = path.basename(filePath);
    const stats = fs.statSync(filePath);
    
    return `[PDF Content from ${filename}]

Error: Could not extract text from PDF (${error.message})

File Information:
- Name: ${filename}
- Size: ${stats.size} bytes
- Last Modified: ${stats.mtime.toISOString()}

Note: The PDF file exists but text extraction failed. This could be due to:
1. Corrupted PDF file
2. Password-protected PDF
3. Scanned images (no text layer)
4. Unsupported PDF format`;
  }
};

module.exports = extractText;
