import { Router } from 'express';
import { obtenerUsos, agregarUso, eliminarUso } from '../controllers/usoController.js';
const router = Router();

router.get('/', obtenerUsos); 
router.post('/', agregarUso);
router.delete('/:id_uso', eliminarUso)

export default router;
