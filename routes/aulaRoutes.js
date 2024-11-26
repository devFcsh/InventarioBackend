import { Router } from 'express';
const router = Router();
import { obtenerAulas, agregarAula } from '../controllers/aulaController.js';

router.get('/:id_edificio', obtenerAulas);
router.post('/', agregarAula);
export default router;