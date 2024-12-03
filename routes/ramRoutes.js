import { Router } from 'express';
const router = Router();
import { obtenerRAM, agregarRAM } from '../controllers/ramController.js';

router.get('/', obtenerRAM);
router.post('/', agregarRAM);

export default router;