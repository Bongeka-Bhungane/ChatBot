const { readUploadedFile, listUploadedFiles } = require('./fileUtils');
const { extractPDFText, getAllUploadedContent } = require('./textExtraction');

module.exports = {
  // File operations
  readUploadedFile,
  listUploadedFiles,
  
  // Text extraction
  extractPDFText,
  getAllUploadedContent
};
