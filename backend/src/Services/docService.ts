import { supabase } from "../lib/supabase";
import { Document } from "../types/document";
const pdf = require("pdf-parse");

const BUCKET_NAME = "Docs";

export const uploadFileDB = async (
  filePath: string,
  file: Express.Multer.File,
): Promise<boolean> => {
  // 4. Upload to Supabase Bucket
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME) // Your Bucket Name
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    console.error("Error uploading file to Supabase:", error);
    return false;
  }

  return true;
};

export const getFileUrlDB = (filePath: string): string => {
  // 5. Get Public URL
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

  if (!data.publicUrl) {
    console.error("Error getting public URL for file:", filePath);
    return "";
  }

  return data.publicUrl;
};

export const processDocumentUpload = async (
  file: Express.Multer.File,
  fileName: string,
): Promise<Document> => {
  try {
    // 1. Resolve the function (Handling potential ESM/CommonJS wrapping)
    const pdfParser = typeof pdf === "function" ? pdf : pdf.default;

    if (typeof pdfParser !== "function") {
      throw new Error(
        "Critical: PDF parser failed to load as a function. Try 'npm install pdf-parse@1.1.1'",
      );
    }

    // 2. Extract Text
    const pdfData = await pdfParser(file.buffer);
    const extractedText = pdfData.text || "No text content found in PDF.";

    const isUploaded = await uploadFileDB(fileName, file);

    console.log(1002, { isUploaded, fileName });

    if (!isUploaded) {
      throw new Error("Failed to upload file to Supabase Storage");
    }

    // 4. Get Public URL
    const publicUrl = await getFileUrlDB(fileName);

    // 5. Save Metadata & Content to Postgres
    // Note: Using camelCase keys to match your specific database columns
    const { data, error: dbError } = await supabase
      .from("documents")
      .insert([
        {
          name: file.originalname,
          fileType: file.mimetype,
          url: publicUrl,
          content: extractedText,
          storagePath: fileName,
        },
      ])
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
export const fetchAllDocsDB = async (): Promise<Document[]> => {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .order("createdAt", { ascending: false });

  if (error) throw error;
  return data;
};

/**
 * Fetch a single document by ID
 */
export const fetchDocById = async (id: string): Promise<Document> => {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Update document metadata (Partial update)
 */
export const updateDocMetadata = async (
  id: string,
  metadata: Partial<{
    name: string;
    fileType: string;
    url: string;
    content: string;
    storagePath: string;
  }>,
) => {
  const { data, error } = await supabase
    .from("documents")
    .update(metadata)
    .eq("id", id)
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
  await supabase.storage.from(BUCKET_NAME).remove([storagePath]);

  // Delete from Database
  const { error } = await supabase.from("documents").delete().eq("id", id);
  if (error) throw error;

  return true;
};
