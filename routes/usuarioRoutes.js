import { Router } from 'express';
import { obtenerUsuarios ,obtenerUsuariosPorUso, agregarUsuario } from '../controllers/usuarioController.js';
const router = Router();

router.get('/', obtenerUsuarios); 
router.get('/usuariosPorUso/:idUso', obtenerUsuariosPorUso); 
router.post('/agregar', agregarUsuario); 

export default router;