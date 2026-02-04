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
//login admin function
export const verifyAdminLogin = async (req: Request, res: Response) => {
  try {
    const { email } = req.body; // Sent from frontend after Google/Email login
    
    const snapshot = await adminCollection.where('email', '==', email).get();
    
    if (snapshot.empty) {
      return res.status(403).json({ message: "Access denied. Not an admin." });
    }

    const adminData = snapshot.docs[0].data();
    res.json({ message: "Login successful", admin: adminData });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Update an existing Admin's details

export const updateAdmin = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, role } = req.body;

    // 1. Check if the body is empty or missing data
    if (!name && !role) {
      return res.status(400).json({ message: "No data provided to update." });
    }

    const adminRef = db.collection('admins').doc(id);
    const doc = await adminRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // 2. Build the update object dynamically (only include defined values)
    const updateData: any = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    if (name !== undefined) updateData.name = name;
    if (role !== undefined) updateData.role = role;

    await adminRef.update(updateData);

    res.json({ message: "Admin updated successfully", updatedFields: Object.keys(updateData) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Delete an Admin
interface AdminParams {
  id: string;
}
export const deleteAdmin = async (req: Request<AdminParams>, res: Response) => {
  try {
    const { id } = req.params;
    await adminCollection.doc(id).delete();
    res.json({ message: "Admin deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};



//upload SOP PDF and process
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
