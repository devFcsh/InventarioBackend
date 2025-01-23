import { Router } from 'express';
const router = Router();
import { obtenerLamparas, lamparasPorModelo, agregarLampara, editarLampara, eliminarLampara } from '../controllers/lamparaController.js'; 

router.get('/', obtenerLamparas);
router.get('/lamparasPorModelo', lamparasPorModelo);
router.post('/', agregarLampara);
router.put('/', editarLampara);
router.delete('/:id_lampara', eliminarLampara)

export default router;