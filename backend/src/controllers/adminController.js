const fs = require('fs');
const path = require('path');

const uploadSOP = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('📁 File uploaded:', {
      originalName: req.file.originalname,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    });

    // Verify it's a PDF file
    if (req.file.mimetype !== 'application/pdf') {
      // Clean up the uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Only PDF files are allowed' });
    }

    // TODO: Add PDF processing and vector store integration here
    // For now, just acknowledge the upload and store the file
    
    const uploadedFile = {
      id: Date.now(),
      originalName: req.file.originalname,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploadDate: new Date().toISOString(),
      processed: false // Will be true when PDF processing is implemented
    };

    console.log('✅ PDF file uploaded successfully:', uploadedFile);

    res.json({ 
      message: 'PDF file uploaded successfully',
      file: uploadedFile,
      note: 'File saved for future processing. PDF processing integration coming soon.'
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    
    // Clean up file if error occurred
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('Failed to cleanup file:', cleanupError);
      }
    }
    
    res.status(500).json({ 
      error: 'Failed to process file upload',
      details: error.message 
    });
  }
};

const listFiles = async (req, res) => {
  try {
    const uploadsDir = 'src/uploads';
    const files = [];
    
    if (fs.existsSync(uploadsDir)) {
      const fileNames = fs.readdirSync(uploadsDir);
      
      for (const fileName of fileNames) {
        const filePath = path.join(uploadsDir, fileName);
        const stats = fs.statSync(filePath);
        
        files.push({
          filename: fileName,
          originalName: fileName.substring(fileName.indexOf('_') + 1),
          size: stats.size,
          uploadDate: stats.mtime.toISOString(),
          path: filePath
        });
      }
    }

    res.json({ files, total: files.length });
  } catch (error) {
    console.error('❌ Error listing files:', error);
    res.status(500).json({ error: 'Failed to list files' });
  }
};

module.exports = { uploadSOP, listFiles };
