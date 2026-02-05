import supabase from '../lib/supabase';

// We use a dynamic require inside the service to ensure we get the raw function
// This is the most reliable way to handle the older pdf-parse library in TS
const pdf = require('pdf-parse');

export const processDocumentUpload = async (file: Express.Multer.File) => {
  try {
    // 1. Resolve the function (Handling potential ESM/CommonJS wrapping)
    const pdfParser = typeof pdf === 'function' ? pdf : pdf.default;

    if (typeof pdfParser !== 'function') {
      throw new Error("Critical: PDF parser failed to load as a function. Try 'npm install pdf-parse@1.1.1'");
    }

    // 2. Extract Text
    const pdfData = await pdfParser(file.buffer);
    const extractedText = pdfData.text || "No text content found in PDF.";

    // 3. Upload to Supabase Storage Bucket
    const fileName = `sop_${Date.now()}_${file.originalname}`;
    const { error: storageError } = await supabase.storage
      .from('sop-documents')
      .upload(fileName, file.buffer, { 
        contentType: file.mimetype,
        upsert: true 
      });

    if (storageError) throw new Error(`Storage Error: ${storageError.message}`);

    // 4. Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('sop-documents')
      .getPublicUrl(fileName);

    // 5. Save Metadata & Content to Postgres
    // Note: Using camelCase keys to match your specific database columns
    const { data, error: dbError } = await supabase
      .from('documents')
      .insert([{
        name: file.originalname,
        fileType: file.mimetype,
        url: publicUrl,
        content: extractedText,
        storagePath: fileName
      }])
      .select()
      .single();

    if (dbError) throw new Error(`Database Error: ${dbError.message}`);
    
    return data;

  } catch (error: any) {
    console.error("DocService Error:", error.message);
    throw error;
  }
};

/**
 * Fetch all documents ordered by creation date
 */
export const fetchAllDocs = async () => {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .order('createdAt', { ascending: false });
    
  if (error) throw error;
  return data;
};

/**
 * Fetch a single document by ID
 */
export const fetchDocById = async (id: string) => {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) throw error;
  return data;
};

/**
 * Update document metadata (Partial update)
 */
export const updateDocMetadata = async (id: string, metadata: Partial<{ name: string; fileType: string; url: string; content: string; storagePath: string; }>) => {
  const { data, error } = await supabase
    .from('documents')
    .update(metadata)
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

/**
 * Delete a document from Storage and Database
 */
export const removeDoc = async (id: string, storagePath: string) => {
  // Delete from Storage first
  await supabase.storage.from('sop-documents').remove([storagePath]);
  
  // Delete from Database
  const { error } = await supabase.from('documents').delete().eq('id', id);
  if (error) throw error;
  
  return true;
};