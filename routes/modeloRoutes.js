import { Router } from 'express';
const router = Router();
import { obtenerModelos, modelosPorMarcaPeriferico } from '../controllers/modeloController.js'; 

router.get('/', obtenerModelos);
router.get('/modelosPorMarcaPeriferico', modelosPorMarcaPeriferico);

export default router;