import { Request, Response } from "express";
import { supabase } from "../lib/supabase";
import { getFileUrlDB, uploadFileDB } from "../Services/bucketService";

export const uploadFile = async (req: Request, res: Response) => {
  console.log("Upload request received");
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).send("No file uploaded.");
    }

    // Generate a unique filename (e.g., CV_1738753200.pdf)
    const fileName = `${Date.now()}_${file.originalname}`;
    console.log("Generated file name:", fileName);

    const existingFile = await getFileUrlDB(fileName);
    if (existingFile) {
      return res
        .status(400)
        .json({ error: "File with the same name already exists." });
    }

    const isUploaded = await uploadFileDB(fileName, file);
    if (!isUploaded) {
      return res.status(500).json({ error: "Failed to upload file." });
    }

    // 5. Get Public URL
    const url = await getFileUrlDB(fileName);

    res.status(200).json({
      message: "Upload successful!",
      url: url,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getFileUrl = async (req: Request, res: Response) => {
  try {
    const filePath = req.params.filePath as string;
    const url = await getFileUrlDB(filePath);

    console.log("Retrieved URL:", url);

    if (!url) {
      return res.status(404).json({ error: "File not found." });
    }
    return res.status(200).json({ url });
  } catch (error) {
    res.status(500).json({ error: "Failed to get file URL." });
  }
};
