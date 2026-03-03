import { Router } from "express";
import multer from "multer";
import * as docsController from "../controllers/docController";
import { getFileUrl } from "../controllers/docController";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() }); // upload document to supabase bucket storage


//..............Document endpoints.............................
router.post("/upload", upload.any(), docsController.uploadDoc);
router.get("/file/:filePath", getFileUrl);
router.get("/", docsController.getAllDocs);
router.delete("/:id", docsController.deleteDoc);

export default router;
