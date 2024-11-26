import { Router } from 'express';
const router = Router();
import { obtenerEdificios, agregarEdificio } from '../controllers/edificioController.js';

router.get('/', obtenerEdificios);
router.post('/', agregarEdificio);
export default router;