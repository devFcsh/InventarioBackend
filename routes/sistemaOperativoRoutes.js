import { Router } from 'express';
const router = Router();
import { obtenerSO, agregarSistemaOperativo, editarSistemaOperativo } from '../controllers/sistemaOperativoController.js';

router.get('/', obtenerSO);
router.post('/', agregarSistemaOperativo);
router.put('/', editarSistemaOperativo);

export default router;