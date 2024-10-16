import { Router } from 'express';
const router = Router();
import { obtenerEdificios } from '../controllers/edificioController';

router.get('/', obtenerEdificios);

export default router;