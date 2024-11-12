import { Router } from 'express';
import { obtenerUsuarios ,obtenerUsuariosPorUso, agregarUsuario, editarUsuario } from '../controllers/usuarioController.js';
const router = Router();

router.get('/', obtenerUsuarios); 
router.get('/usuariosPorUso/:idUso', obtenerUsuariosPorUso); 
router.post('/agregar', agregarUsuario); 
router.put('/:id_usuario', editarUsuario); 
export default router;