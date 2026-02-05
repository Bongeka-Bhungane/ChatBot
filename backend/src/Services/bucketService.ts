import { supabase } from "../lib/supabase";

export const uploadFileDB = async (
  filePath: string,
  file: Express.Multer.File,
): Promise<boolean> => {
  // 4. Upload to Supabase Bucket
  const { data, error } = await supabase.storage
    .from("MlabDocs") // Your Bucket Name
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
  const { data } = supabase.storage.from("MlabDocs").getPublicUrl(filePath);

  if (!data.publicUrl) {
    console.error("Error getting public URL for file:", filePath);
    return "";
  }

  return data.publicUrl;
};
