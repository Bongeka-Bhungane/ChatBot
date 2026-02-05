import { Request, Response } from "express";
import {
  addAdminDB,
  deleteAdminDB,
  getAdminByIdDB,
  getAdminsDB,
  updateAdminDB,
} from "../Services/adminService";
import { Admin } from "../types/admin";
import { validateEmail } from "../utils/emailValidator";

export const getAllAdmins = async (req: Request, res: Response) => {
  try {
    const admins = await getAdminsDB();
    res.json(admins);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch admins." });
  }
};

export const getAdminById = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  try {
    const admin = await getAdminByIdDB(id);
    res.json(admin);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch admin." });
  }
};

export const addAdmin = async (req: Request, res: Response) => {
  try {
    const payload = req.body as Admin;

    if (!validateEmail(payload.email)) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    await addAdminDB(payload);

    res.status(201).json({ message: "Admin added successfully." });

    // Implementation for adding an admin
  } catch (error) {
    res.status(500).json({ error: "Failed to add admin." });
  }
};

export const updateAdmin = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const payload = req.body as Admin;
  try {
    await updateAdminDB(id, payload);
    res.json({ message: "Admin updated successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to update admin." });
  }
};

export const deleteAdmin = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  try {
    await deleteAdminDB(id);
    res.json({ message: "Admin deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete admin." });
  }
};
