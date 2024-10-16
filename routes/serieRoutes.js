import { Router } from 'express';
const router = Router();
import { obtenerSeries, seriesPorModelo } from '../controllers/serieController'; 

router.get('/', obtenerSeries);
router.get('/seriesPorModelo', seriesPorModelo);

export default router;