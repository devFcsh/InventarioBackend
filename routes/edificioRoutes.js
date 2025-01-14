import { Router } from 'express';
const router = Router();
import { obtenerEdificios, agregarEdificio, editarEdificio } from '../controllers/edificioController.js';

router.get('/', obtenerEdificios);
router.post('/', agregarEdificio);
router.put('/', editarEdificio);

export default router;