import { Router } from 'express';
const router = Router();
import  {obtenerPerifericos, agregarPeriferico, editarPeriferico, eliminarPeriferico}  from '../controllers/perifericoController.js';

router.get('/', obtenerPerifericos);
router.post('/', agregarPeriferico);
router.put('/', editarPeriferico);
router.delete('/:id_periferico', eliminarPeriferico)

export default router;