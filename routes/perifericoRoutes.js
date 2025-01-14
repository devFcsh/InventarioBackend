import { Router } from 'express';
const router = Router();
import  {obtenerPerifericos, agregarPeriferico, editarPeriferico}  from '../controllers/perifericoController.js';

router.get('/', obtenerPerifericos);
router.post('/', agregarPeriferico);
router.put('/', editarPeriferico);

export default router;