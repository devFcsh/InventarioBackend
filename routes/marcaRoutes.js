import { Router } from 'express';
import { obtenerMarcas, obtenerMarcasPorPeriferico } from '../controllers/marcaController'; 
const router = Router();

router.get('/', obtenerMarcas);
router.get('/marcasPorPeriferico/:perifericoId', obtenerMarcasPorPeriferico);

export default router;