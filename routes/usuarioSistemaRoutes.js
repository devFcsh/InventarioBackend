import { Router } from 'express';
import { agregarUsuarioSistema, editarUsuarioSistema, eliminarUsuarioSistema, obtenerUsuariosSistema } from '../controllers/usuarioSistemaController';
const router = Router();

router.get('/', obtenerUsuariosSistema); 
router.post('/agregar', agregarUsuarioSistema); 
router.put('/:id_usuario', editarUsuarioSistema);
router.delete('/:id_usuario', eliminarUsuarioSistema);

export default router;