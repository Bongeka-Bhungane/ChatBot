import { Router } from "express";
import {
  createModel,
  deleteModel,
  getAllModels,
  getModelById,
  updateModel,
} from "../controllers/modelController";

const router = Router();

//.....................model endpoints.................
router.get("/", getAllModels);
router.get("/:id", getModelById);
router.post("/", createModel);
router.put("/:id", updateModel);
router.delete("/:id", deleteModel);

export default router;
