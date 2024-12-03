import { Router } from 'express';
import { obtenerUsos, agregarUso } from '../controllers/usoController.js';
const router = Router();

router.get('/', obtenerUsos); 
router.post('/', agregarUso);

export default router;
