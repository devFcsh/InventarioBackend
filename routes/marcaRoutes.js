import { Router } from 'express';
import { obtenerMarcas, obtenerMarcasPorPeriferico, obtenerMarcaDetalle, agregarMarca, editarMarca, eliminarMarca } from '../controllers/marcaController.js'; 
const router = Router();

router.get('/', obtenerMarcas);
router.get('/marcasPorPeriferico/:perifericoId', obtenerMarcasPorPeriferico);
router.get('/:id_marca/detalle', obtenerMarcaDetalle);
router.post('/', agregarMarca);
router.put('/', editarMarca);
router.delete('/:id_marca', eliminarMarca)

export default router;