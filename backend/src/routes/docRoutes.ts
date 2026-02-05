import { Router } from 'express';
import multer from 'multer';
import * as docsController from '../controllers/docController';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.any(), docsController.uploadDoc);
//router.get('/', docsController.getAllDocs);
//router.delete('/:id', docsController.deleteDoc);

export default router;