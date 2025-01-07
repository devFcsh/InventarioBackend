import { Router } from 'express';
const router = Router();
import { obtenerUbicaciones, agregarUbicacion } from '../controllers/ubicacionController.js';

router.get('/:id_edificio', obtenerUbicaciones);
router.post('/', agregarUbicacion);
export default router;