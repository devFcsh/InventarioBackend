import { Router } from 'express';
const router = Router();
import { obtenerDiscos, agregarEdificio } from '../controllers/discoController.js';

router.get('/', obtenerDiscos);
router.post('/', agregarEdificio);
export default router;