import { Router } from 'express';
const router = Router();
import { obtenerModelos, modelosPorMarcaPeriferico, agregarModelo } from '../controllers/modeloController.js'; 

router.get('/', obtenerModelos);
router.get('/modelosPorMarcaPeriferico', modelosPorMarcaPeriferico);
router.post('/', agregarModelo);

export default router;