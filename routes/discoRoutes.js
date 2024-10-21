import { Router } from 'express';
const router = Router();
import { obtenerDiscos } from '../controllers/discoController.js';

router.get('/', obtenerDiscos);

export default router;