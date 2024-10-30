import { Router } from 'express';
import { obtenerUsuarios ,obtenerUsuariosPorUso } from '../controllers/usuarioController.js';
const router = Router();

router.get('/usuarios', obtenerUsuarios); 
router.get('/usuariosPorUso/:idUso', obtenerUsuariosPorUso); 


export default router;
