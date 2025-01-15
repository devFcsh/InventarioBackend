import { Router } from 'express';
const router = Router();
import { obtenerEdificios, agregarEdificio, editarEdificio, eliminarEdificio } from '../controllers/edificioController.js';

router.get('/', obtenerEdificios);
router.post('/', agregarEdificio);
router.put('/', editarEdificio);
router.delete('/:id_edificio', eliminarEdificio)
export default router;