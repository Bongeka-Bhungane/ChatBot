import { Request, Response } from 'express';
import * as docService from '../Services/docService';

export const uploadDoc = async (req: Request, res: Response) => {
  try {
    // req.files is used for upload.any()
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No file received by Multer" });
    }

    const result = await docService.processDocumentUpload(files[0]);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
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