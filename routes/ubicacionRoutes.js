import { Router } from 'express';
const router = Router();
import { obtenerUbicaciones, agregarUbicacion, obtenerUbicacionesCompletas } from '../controllers/ubicacionController.js';

router.get('/', obtenerUbicacionesCompletas);
router.get('/:id_edificio', obtenerUbicaciones);
router.post('/', agregarUbicacion);
export default router;