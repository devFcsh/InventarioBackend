import { Router } from 'express';
import { obtenerMarcas, obtenerMarcasPorPeriferico, agregarMarca } from '../controllers/marcaController.js'; 
const router = Router();

router.get('/', obtenerMarcas);
router.get('/marcasPorPeriferico/:perifericoId', obtenerMarcasPorPeriferico);
router.post('/', agregarMarca)
export default router;