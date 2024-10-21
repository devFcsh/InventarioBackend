import { Router } from 'express';
import { obtenerUsuariosPorUso } from '../controllers/usuarioController.js';
const router = Router();

router.get('/usuariosPorUso/:idUso', obtenerUsuariosPorUso); 

export default router;
