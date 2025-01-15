import { Router } from 'express';
const router = Router();
import { obtenerDominios, agregarDominio, editarDominio, eliminarDominio } from '../controllers/dominioController.js';

router.get('/', obtenerDominios);
router.put('/', editarDominio);
router.post('/', agregarDominio);
router.delete('/:id_dominio', eliminarDominio);

export default router;