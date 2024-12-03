import { Router } from 'express';
const router = Router();
import { obtenerSeries, seriesPorModelo, agregarSerie } from '../controllers/serieController.js'; 

router.get('/', obtenerSeries);
router.get('/seriesPorModelo', seriesPorModelo);
router.post('/', agregarSerie);

export default router;