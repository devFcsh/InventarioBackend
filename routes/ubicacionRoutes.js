import { Router } from 'express';
const router = Router();
import { obtenerUbicaciones, agregarUbicacion, obtenerUbicacionesCompletas, editarUbicacion, eliminarUbicacion } from '../controllers/ubicacionController.js';

router.get('/', obtenerUbicacionesCompletas);
router.get('/:id_edificio', obtenerUbicaciones);
router.post('/', agregarUbicacion);
router.put('/', editarUbicacion);
router.delete('/:id_ubicacion', eliminarUbicacion)

export default router;