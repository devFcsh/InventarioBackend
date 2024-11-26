import { Router } from 'express';
const router = Router();
import { obtenerDominios, agregarDominio } from '../controllers/dominioController.js';

router.get('/', obtenerDominios);
router.post('/', agregarDominio);
export default router;