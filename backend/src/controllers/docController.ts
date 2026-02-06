import { Request, Response } from "express";
import * as docService from "../Services/docService";
import { getFileUrlDB } from "../Services/docService";

export const uploadDoc = async (req: Request, res: Response) => {
  try {
    // req.files is used for upload.any()
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No file received by Multer" });
    }

    console.log({ files });

    const fileName = files[0].originalname; // Use original filename for storage

    const existingFile = await getFileUrlDB(fileName);

    if (existingFile) {
      return res
        .status(400)
        .json({ error: "File with the same name already exists" });
    }

    const result = await docService.processDocumentUpload(files[0], fileName);

    console.log(1000, result);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
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

// export const getAllDocs = async (_req: Request, res: Response) => {
//   try {
//     const docs = await docService.fetchAllDocs();
//     res.json(docs);
//   } catch (error: any) {
//     res.status(500).json({ error: error.message });
//   }
// };

// export const getDocById = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const doc = await docService.fetchDocById(id as string);
//     res.json(doc);
//   } catch (error: any) {
//     res.status(500).json({ error: error.message });
//   }
// };

// export const updateDoc = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const metadata = req.body;
//     const updatedDoc = await docService.updateDocMetadata(id as string, metadata);
//     res.json(updatedDoc);
//   } catch (error: any) {
//     res.status(500).json({ error: error.message });
//   }
// };

// export const deleteDoc = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params
//     const { storage_path } = req.query; // Passed as query param
//     await docService.removeDoc(id as string, storage_path as string);
//     res.json({ message: "Document deleted successfully" });
//   } catch (error: any) {
//     res.status(500).json({ error: error.message });
//   }
