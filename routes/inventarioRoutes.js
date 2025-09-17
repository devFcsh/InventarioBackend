import { Router } from 'express';
const router = Router();
import { existeInventario, inventarioPorSerie, obtenerInventarios } from '../controllers/inventarioController.js'; 

router.get('/', obtenerInventarios);
router.get('/inventariosPorSerie', inventarioPorSerie);
router.get('/existeInventario', existeInventario);
export default router;