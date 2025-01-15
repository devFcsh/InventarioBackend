import { Router } from 'express';
const router = Router();
import { obtenerModelos, modelosPorMarcaPeriferico, agregarModelo, editarModelo, eliminarModelo } from '../controllers/modeloController.js'; 

router.get('/', obtenerModelos);
router.get('/modelosPorMarcaPeriferico', modelosPorMarcaPeriferico);
router.post('/', agregarModelo);
router.put('/', editarModelo);
router.delete('/:id_modelo', eliminarModelo)

export default router;