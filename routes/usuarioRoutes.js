import { Router } from 'express';
import { obtenerUsuarios ,obtenerUsuariosPorUso, agregarUsuario, editarUsuario, eliminarUsuario, obtenerTodosUsuarios } from '../controllers/usuarioController.js';
const router = Router();

router.get('/', obtenerUsuarios); 
router.get('/todos', obtenerTodosUsuarios); 
router.get('/usuariosPorUso/:idUso', obtenerUsuariosPorUso); 
router.post('/agregar', agregarUsuario); 
router.put('/:id_usuario', editarUsuario);
router.delete('/:id_usuario', eliminarUsuario);

export default router;