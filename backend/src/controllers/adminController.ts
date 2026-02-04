import { Request, Response } from 'express';
import * as multer from 'multer';
import * as admin from 'firebase-admin';
import { db } from '../config/firebase';

//admin CRUD operations for admins to upload SOP PDFs and process them
const adminCollection = db.collection('admins');;

export const registerAdmin = async (req: Request, res: Response) => {
  try {
    const { email, name, role } = req.body;
    
    // Check if admin already exists
    const existing = await adminCollection.where('email', '==', email).get();
    if (!existing.empty) {
      return res.status(400).json({ message: "Admin already registered" });
    }

    const newAdmin = {
      email,
      name,
  
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await adminCollection.add(newAdmin);
    res.status(201).json({ id: docRef.id, ...newAdmin });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllAdmins = async (_req: Request, res: Response) => {
  try {
    const snapshot = await adminCollection.get();
    const admins = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(admins);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Add deleteAdmin and updateAdmin similarly...

export const uploadSOP = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // TODO: Implement PDF processing and vector store integration
    // For now, just acknowledge the upload
    res.json({ 
      message: 'File uploaded successfully',
      filename: req.file.filename,
      originalName: req.file.originalname
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to process file upload' });
  }
};
