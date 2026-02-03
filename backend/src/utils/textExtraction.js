const fs = require('fs');
const path = require('path');
const extractText = require('./pdfExtractor');

/**
 * Extract text from a PDF file using the pdfExtractor utility
 * @param {string} filename - The PDF filename
 * @returns {string} - Extracted text or error message
 */
const extractPDFText = async (filename) => {
  try {
    const filePath = path.join(__dirname, '../uploads', filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return `Error: File ${filename} not found`;
    }
    
    console.log(`📄 Extracting text from PDF: ${filename}`);
    
    // Extract text using the pdfExtractor utility
    const extractedContent = await extractText(filePath);
    
    console.log(`✅ Successfully processed PDF: ${filename}`);
    return extractedContent;
    
  } catch (error) {
    console.error(`❌ Could not extract text from PDF ${filename}:`, error.message);
    return `Error extracting text from ${filename}: ${error.message}`;
  }
};

/**
 * Get all text content from uploaded files (both TXT and PDF)
 * @returns {string} - Combined content from all text files
 */
const getAllUploadedContent = async () => {
  try {
    const uploadsDir = path.join(__dirname, '../uploads');
    const files = fs.readdirSync(uploadsDir);
    
    let allContent = '';
    
    for (const filename of files) {
      if (filename.endsWith('.txt')) {
        try {
          const filePath = path.join(uploadsDir, filename);
          const content = fs.readFileSync(filePath, 'utf8');
          allContent += `\n--- Content from ${filename} ---\n${content}\n`;
        } catch (error) {
          console.error(`❌ Could not read ${filename}:`, error.message);
        }
      } else if (filename.endsWith('.pdf')) {
        const pdfContent = await extractPDFText(filename);
        allContent += `\n--- Content from ${filename} ---\n${pdfContent}\n`;
      }
    }
    
    return allContent.trim();
  } catch (error) {
    console.error('❌ Could not get uploaded content:', error.message);
    return '';
  }
};

module.exports = {
  extractPDFText,
  getAllUploadedContent
};
