import { Router } from 'express';
const router = Router();
import { obtenerVersionesOffice, agregarVersionOffice, editarVersionOffice, eliminarVersionOffice } from '../controllers/versionOfficeController.js';

router.get('/', obtenerVersionesOffice);
router.post('/', agregarVersionOffice);
router.put('/', editarVersionOffice);
router.delete('/:id_version_office', eliminarVersionOffice)

export default router;