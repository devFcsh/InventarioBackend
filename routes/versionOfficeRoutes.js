import { Router } from 'express';
const router = Router();
import { obtenerVersionesOffice } from '../controllers/versionOfficeController.js';

router.get('/', obtenerVersionesOffice);

export default router;