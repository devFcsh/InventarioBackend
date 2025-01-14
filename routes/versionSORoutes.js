import { Router } from 'express';
const router = Router();
import { obtenerVersionesSO, obtenerVersionesCompletasSO, agregarVersionSO, editarVersionSO } from '../controllers/versionSOController.js';

router.get('/', obtenerVersionesCompletasSO);
router.get('/:id_sistemaoperativo', obtenerVersionesSO);
router.post('/', agregarVersionSO);
router.put('/', editarVersionSO);

export default router;