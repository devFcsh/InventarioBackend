import { Router } from 'express';
import { obtenerUsuariosPorUso } from '../controllers/usuarioController';
const router = Router();

router.get('/usuariosPorUso/:idUso', obtenerUsuariosPorUso); 

export default router;
