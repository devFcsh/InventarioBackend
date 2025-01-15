import { Router } from 'express';
import { obtenerMarcas, obtenerMarcasPorPeriferico, agregarMarca, editarMarca, eliminarMarca } from '../controllers/marcaController.js'; 
const router = Router();

router.get('/', obtenerMarcas);
router.get('/marcasPorPeriferico/:perifericoId', obtenerMarcasPorPeriferico);
router.post('/', agregarMarca);
router.put('/', editarMarca);
router.delete('/:id_marca', eliminarMarca)

export default router;