import { Router } from 'express';
const router = Router();
import { obtenerVersionesOffice, agregarVersionOffice, editarVersionOffice } from '../controllers/versionOfficeController.js';

router.get('/', obtenerVersionesOffice);
router.post('/', agregarVersionOffice);
router.put('/', editarVersionOffice);

export default router;