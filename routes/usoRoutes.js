import { Router } from 'express';
import { obtenerUsos, agregarUso, eliminarUso, editarUso } from '../controllers/usoController.js';
const router = Router();

router.get('/', obtenerUsos); 
router.post('/', agregarUso);
router.delete('/:id_uso', eliminarUso)
router.put('/', editarUso);

export default router;
