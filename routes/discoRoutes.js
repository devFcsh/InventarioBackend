import { Router } from 'express';
const router = Router();
import { obtenerDiscos, agregarDisco } from '../controllers/discoController.js';

router.get('/', obtenerDiscos);
router.post('/', agregarDisco);
export default router;