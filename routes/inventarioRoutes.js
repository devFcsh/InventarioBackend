import { Router } from 'express';
const router = Router();
import { inventarioPorSerie } from '../controllers/inventarioController'; 

router.get('/inventariosPorSerie', inventarioPorSerie);

export default router;