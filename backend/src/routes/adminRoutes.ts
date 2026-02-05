import { Router } from "express";
import {
  addAdmin,
  deleteAdmin,
  getAdminById,
  getAllAdmins,
  updateAdmin,
} from "../controllers/adminController";

const router = Router();

router.get("/", getAllAdmins);
router.get("/:id", getAdminById);
router.post("/", addAdmin);
router.put("/:id", updateAdmin);
router.delete("/:id", deleteAdmin);

export default router;
