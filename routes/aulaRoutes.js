import { Router } from 'express';
const router = Router();
import { obtenerAulas } from '../controllers/aulaController.js';

router.get('/:id_edificio', obtenerAulas);

export default router;