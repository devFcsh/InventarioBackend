import { Router } from 'express';
const router = Router();
import { obtenerVersionesSO } from '../controllers/versionSOController';

router.get('/:id_sistemaoperativo', obtenerVersionesSO);

export default router;