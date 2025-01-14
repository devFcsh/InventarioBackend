import { Router } from 'express';
const router = Router();
import { obtenerDiscos, agregarDisco, editarDisco } from '../controllers/discoController.js';

router.get('/', obtenerDiscos);
router.post('/', agregarDisco);
router.put('/', editarDisco);

export default router;