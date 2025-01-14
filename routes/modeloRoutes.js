import { Router } from 'express';
const router = Router();
import { obtenerModelos, modelosPorMarcaPeriferico, agregarModelo, editarModelo } from '../controllers/modeloController.js'; 

router.get('/', obtenerModelos);
router.get('/modelosPorMarcaPeriferico', modelosPorMarcaPeriferico);
router.post('/', agregarModelo);
router.put('/', editarModelo);

export default router;