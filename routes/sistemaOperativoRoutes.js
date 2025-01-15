import { Router } from 'express';
const router = Router();
import { obtenerSO, agregarSistemaOperativo, editarSistemaOperativo, eliminarSistemaOperativo } from '../controllers/sistemaOperativoController.js';

router.get('/', obtenerSO);
router.post('/', agregarSistemaOperativo);
router.put('/', editarSistemaOperativo);
router.delete('/:id_sistemaoperativo', eliminarSistemaOperativo)

export default router;