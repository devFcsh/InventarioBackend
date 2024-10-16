import { Router } from 'express';
const router = Router();
import { obtenerRAM } from '../controllers/ramController';

router.get('/', obtenerRAM);

export default router;