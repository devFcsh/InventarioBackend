import { Router } from 'express';
const router = Router();
import { obtenerEquiposActivos, obtenerEquiposBodega, obtenerEquiposBaja, obtenerComputadora, eliminarEquipo, darDeBajaEquipo, editarEquipo, agregarEquipo, agregarComponentes, gestionarComponentesEditados, uploadImage } from '../controllers/equipoController.js'; 
import upload from '../middlewares/uploadImageMiddleware.js';

router.get('/', obtenerEquiposActivos);
router.get('/bodega', obtenerEquiposBodega);
router.get('/baja', obtenerEquiposBaja);
router.get('/computadora/:id', obtenerComputadora);
router.delete('/computadora/:equipoId', eliminarEquipo);
router.put('/darDeBajaEquipo/:equipoId', darDeBajaEquipo);
router.put('/editarEquipo/:equipoId', editarEquipo);
router.post("/agregarActivoComputadora", agregarEquipo);
router.post("/agregarComponentes", agregarComponentes);
router.post("/gestionarComponentes", gestionarComponentesEditados);
router.post("/upload", upload.single("image"), uploadImage);
export default router;