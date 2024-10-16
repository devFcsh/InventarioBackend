import { Router } from 'express';
const router = Router();
import { obtenerVersionesOffice } from '../controllers/versionOfficeController';

router.get('/', obtenerVersionesOffice);

export default router;