import { Router } from 'express';
import { registerAdmin, getAllAdmins, verifyAdminLogin, deleteAdmin, updateAdmin } from '../controllers/adminController';

const router = Router();

router.post('/register', registerAdmin);
router.get('/', getAllAdmins);
router.post('/login', verifyAdminLogin);
router.put('/:id', updateAdmin);      
router.delete('/:id', deleteAdmin);

export default router;