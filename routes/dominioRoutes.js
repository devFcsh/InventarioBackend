import { Router } from 'express';
const router = Router();
import { obtenerDominios } from '../controllers/dominioController.js';

router.get('/', obtenerDominios);

export default router;