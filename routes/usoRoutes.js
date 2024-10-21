import { Router } from 'express';
import { obtenerUsos } from '../controllers/usoController.js';
const router = Router();

router.get('/', obtenerUsos); 

export default router;
