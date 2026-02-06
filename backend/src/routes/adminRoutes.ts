import { Router } from "express";
import {
  addAdmin,
  deleteAdmin,
  getAdminById,
  getAllAdmins,
  loginAdmin,
  updateAdmin,
} from "../controllers/adminController";

const router = Router();

router.get("/", getAllAdmins);
router.get("/:id", getAdminById);
router.post("/register", addAdmin);
router.post("/login", loginAdmin);
router.put("/:id", updateAdmin);
router.delete("/:id", deleteAdmin);

export default router;
