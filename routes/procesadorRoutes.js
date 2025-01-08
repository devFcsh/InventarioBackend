import { Router } from 'express';
const router = Router();
import { obtenerProcesadores, agregarProcesador } from '../controllers/procesadorController.js'; 

router.get('/', obtenerProcesadores);
router.post('/', agregarProcesador);

export default router;