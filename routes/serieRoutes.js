import { Router } from 'express';
const router = Router();
import { obtenerSeries, seriesPorModelo, agregarSerie, editarSerie, eliminarSerie } from '../controllers/serieController.js'; 

router.get('/', obtenerSeries);
router.get('/seriesPorModelo', seriesPorModelo);
router.post('/', agregarSerie);
router.put('/', editarSerie);
router.delete('/:id_serie', eliminarSerie)

export default router;