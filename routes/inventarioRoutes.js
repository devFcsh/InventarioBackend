import { Router } from 'express';
const router = Router();
import { inventarioPorSerie } from '../controllers/inventarioController.js'; 

router.get('/inventariosPorSerie', inventarioPorSerie);

export default router;