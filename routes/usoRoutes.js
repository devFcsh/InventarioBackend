import { Router } from 'express';
import { obtenerUsos } from '../controllers/usoController';
const router = Router();

router.get('/', obtenerUsos); 

export default router;
