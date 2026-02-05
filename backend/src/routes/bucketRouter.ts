import { Router } from "express";
import { getFileUrl, uploadFile } from "../controllers/bucketController";
import multer from "multer";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", upload.single("file"), uploadFile);
router.get("/file/:filePath", getFileUrl);

export default router;
