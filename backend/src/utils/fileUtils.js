const fs = require('fs');
const path = require('path');

/**
 * Read the content of a file from the uploads directory
 * @param {string} filename - The name of the file to read
 * @returns {string} - The file content or empty string if file doesn't exist
 */
const readUploadedFile = (filename) => {
  try {
    const filePath = path.join(__dirname, '../uploads', filename);
    const content = fs.readFileSync(filePath, 'utf8');
    console.log(`✅ Successfully read file: ${filename}`);
    return content;
  } catch (error) {
    console.error(`❌ Could not read file ${filename}:`, error.message);
    return '';
  }
};

/**
 * List all files in the uploads directory
 * @returns {Array} - Array of file information
 */
const listUploadedFiles = () => {
  try {
    const uploadsDir = path.join(__dirname, '../uploads');
    const files = fs.readdirSync(uploadsDir);
    
    return files.map(filename => {
      const filePath = path.join(uploadsDir, filename);
      const stats = fs.statSync(filePath);
      return {
        filename,
        size: stats.size,
        modified: stats.mtime,
        isText: filename.endsWith('.txt'),
        isPDF: filename.endsWith('.pdf')
      };
    });
  } catch (error) {
    console.error('❌ Could not list uploads directory:', error.message);
    return [];
  }
};

module.exports = {
  readUploadedFile,
  listUploadedFiles
};
