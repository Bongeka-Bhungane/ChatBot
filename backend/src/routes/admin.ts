import { Router } from 'express';
import { registerAdmin, getAllAdmins } from '../controllers/adminController';

const router = Router();

router.post('/register', registerAdmin);
router.get('/', getAllAdmins);

export default router;