import { Router } from 'express';
import { agregarUsuarioSistema, editarUsuarioSistema, eliminarUsuarioSistema, obtenerUsuariosSistema } from '../controllers/usuarioSistemaController.js';
const router = Router();

router.get('/', obtenerUsuariosSistema); 
router.post('/agregar', agregarUsuarioSistema); 
router.put('/:id_usuario_sistema', editarUsuarioSistema);
router.delete('/:id_usuario_sistema', eliminarUsuarioSistema);

export default router;
