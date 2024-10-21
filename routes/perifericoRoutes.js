import { Router } from 'express';
const router = Router();
import  {obtenerPerifericos}  from '../controllers/perifericoController.js';

router.get('/', obtenerPerifericos);

export default router;