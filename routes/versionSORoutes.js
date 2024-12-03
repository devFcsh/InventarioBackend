import { Router } from 'express';
const router = Router();
import { obtenerVersionesSO, agregarVersionSO } from '../controllers/versionSOController.js';

router.get('/:id_sistemaoperativo', obtenerVersionesSO);
router.post('/', agregarVersionSO);

export default router;