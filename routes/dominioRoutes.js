import { Router } from 'express';
const router = Router();
import { obtenerDominios, agregarDominio, editarDominio } from '../controllers/dominioController.js';

router.get('/', obtenerDominios);
router.put('/', editarDominio);
router.post('/', agregarDominio);
export default router;