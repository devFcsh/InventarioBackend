import { Router } from 'express';
const router = Router();
import { obtenerVersionesSO, obtenerVersionesCompletasSO, agregarVersionSO } from '../controllers/versionSOController.js';

router.get('/', obtenerVersionesCompletasSO);
router.get('/:id_sistemaoperativo', obtenerVersionesSO);
router.post('/', agregarVersionSO);

export default router;