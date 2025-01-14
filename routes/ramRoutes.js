import { Router } from 'express';
const router = Router();
import { obtenerRAM, agregarRAM, editarRAM } from '../controllers/ramController.js';

router.get('/', obtenerRAM);
router.post('/', agregarRAM);
router.put('/', editarRAM);

export default router;