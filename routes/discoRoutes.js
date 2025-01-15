import { Router } from 'express';
const router = Router();
import { obtenerDiscos, agregarDisco, editarDisco, eliminarDisco } from '../controllers/discoController.js';

router.get('/', obtenerDiscos);
router.post('/', agregarDisco);
router.put('/', editarDisco);
router.delete('/:id_disco', eliminarDisco);

export default router;