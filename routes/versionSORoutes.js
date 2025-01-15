import { Router } from 'express';
const router = Router();
import { obtenerVersionesSO, obtenerVersionesCompletasSO, agregarVersionSO, editarVersionSO, eliminarVersionSO } from '../controllers/versionSOController.js';

router.get('/', obtenerVersionesCompletasSO);
router.get('/:id_sistemaoperativo', obtenerVersionesSO);
router.post('/', agregarVersionSO);
router.put('/', editarVersionSO);
router.delete('/:id_versionso', eliminarVersionSO)

export default router;