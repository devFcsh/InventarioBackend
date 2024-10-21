import { Router } from 'express';
const router = Router();
import { obtenerSO } from '../controllers/sistemaOperativoController.js';

router.get('/', obtenerSO);

export default router;