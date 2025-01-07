import { Router } from 'express';
const router = Router();
import { inventarioPorSerie, obtenerInventarios } from '../controllers/inventarioController.js'; 

router.get('/', obtenerInventarios);
router.get('/inventariosPorSerie', inventarioPorSerie);

export default router;