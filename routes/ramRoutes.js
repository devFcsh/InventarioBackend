import { Router } from 'express';
const router = Router();
import { obtenerRAM } from '../controllers/ramController.js';

router.get('/', obtenerRAM);

export default router;