import { Router } from 'express';
const router = Router();
import { obtenerSeries, seriesPorModelo, agregarSerie, editarSerie } from '../controllers/serieController.js'; 

router.get('/', obtenerSeries);
router.get('/seriesPorModelo', seriesPorModelo);
router.post('/', agregarSerie);
router.put('/', editarSerie);

export default router;