import { Router } from 'express';
const router = Router();
import { obtenerProcesadores, agregarProcesador, editarProcesador } from '../controllers/procesadorController.js'; 

router.get('/', obtenerProcesadores);
router.post('/', agregarProcesador);
router.put('/', editarProcesador);

export default router;