import { Router } from 'express';
const router = Router();
import { obtenerVersionesOffice, agregarVersionOffice } from '../controllers/versionOfficeController.js';

router.get('/', obtenerVersionesOffice);
router.post('/', agregarVersionOffice);

export default router;