import { Router } from 'express';
import { agregarRol, editarRol, eliminarRol, obtenerRoles } from '../controllers/rolController.js';
const router = Router();

router.get('/', obtenerRoles); 
router.post('/', agregarRol);
router.delete('/:id_uso', eliminarRol)
router.put('/', editarRol);

export default router;
