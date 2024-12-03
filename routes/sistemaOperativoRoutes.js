import { Router } from 'express';
const router = Router();
import { obtenerSO, agregarSistemaOperativo } from '../controllers/sistemaOperativoController.js';

router.get('/', obtenerSO);
router.post('/', agregarSistemaOperativo);

export default router;