import { Router } from 'express';
const router = Router();
import { obtenerProcesadores, agregarProcesador, editarProcesador, eliminarProcesador } from '../controllers/procesadorController.js'; 

router.get('/', obtenerProcesadores);
router.post('/', agregarProcesador);
router.put('/', editarProcesador);
router.delete('/:id_procesador', eliminarProcesador)

export default router;