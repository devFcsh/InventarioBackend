import { Router } from 'express';
const router = Router();
import  {obtenerPerifericos, agregarPeriferico}  from '../controllers/perifericoController.js';

router.get('/', obtenerPerifericos);
router.post('/', agregarPeriferico);

export default router;