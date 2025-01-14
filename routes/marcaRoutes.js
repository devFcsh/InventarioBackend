import { Router } from 'express';
import { obtenerMarcas, obtenerMarcasPorPeriferico, agregarMarca, editarMarca } from '../controllers/marcaController.js'; 
const router = Router();

router.get('/', obtenerMarcas);
router.get('/marcasPorPeriferico/:perifericoId', obtenerMarcasPorPeriferico);
router.post('/', agregarMarca);
router.put('/', editarMarca);

export default router;