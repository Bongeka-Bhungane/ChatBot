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
import { supabase } from "../lib/supabase";

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

export const loginAdmin = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const admin = await getAdminsDB();
    const foundAdmin = admin.find(
      (adm) => adm.email === email && adm.password === password,
    );
    if (foundAdmin) {
      res.json({ message: "Login successful", admin: foundAdmin });
    } else {
      res.status(401).json({ error: "Invalid email or password." });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to login." });
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

// fetching all chat logs for searching and filtering

export const getChatLogs = async (req: Request, res: Response) => {
  try {
    const { search, lang, type, framework, code, start, end } = req.query;

    let query = supabase.from('chat_logs').select('*').order('createdAt', { ascending: false });

    // Ensure we only add filters if the values actually exist
    if (search && search !== '') query = query.ilike('question', `%${search}%`);
    if (lang && lang !== '') query = query.eq('language_env', lang);
    if (type && type !== '') query = query.eq('question_type', type);
    if (framework && framework !== '') query = query.eq('framework', framework);
    if (code && code !== '') query = query.eq('has_code', code === 'true');

    const { data, error } = await query;

    if (error) {
      console.error("Supabase Error:", error);
      return res.status(400).json({ error: error.message });
    }

    // ALWAYS return an array, even if empty
    res.json(data || []);
  } catch (err: any) {
    console.error("Server Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};