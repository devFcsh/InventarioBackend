import { Router } from 'express';
const router = Router();
import { obtenerRAM, agregarRAM, editarRAM, eliminarRAM } from '../controllers/ramController.js';

router.get('/', obtenerRAM);
router.post('/', agregarRAM);
router.put('/', editarRAM);
router.delete('/:id_ram', eliminarRAM)

export default router;