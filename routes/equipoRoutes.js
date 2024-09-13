const express = require('express');
const router = express.Router();
const equipoController = require('../controllers/equipoController'); 
const upload = require('../middlewares/uploadImageMiddleware');

router.get('/', equipoController.obtenerEquipos);
router.get('/totalEquipos', equipoController.contarEquipos);
router.delete('/eliminarActivoComputadora/:equipoId', equipoController.eliminarActivoComputadora);
router.delete('/eliminarActivoComponente/:equipoId', equipoController.eliminarActivoComponente);
router.delete('/eliminarActivoOtro/:equipoId', equipoController.eliminarActivoOtro);
router.post("/agregarActivoComputadora", equipoController.agregarActivoComputadora);
router.post("/upload", upload.single("image"), equipoController.subirImagen);
module.exports = router;