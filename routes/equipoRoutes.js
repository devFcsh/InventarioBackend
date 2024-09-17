const express = require('express');
const router = express.Router();
const equipoController = require('../controllers/equipoController'); 
const upload = require('../middlewares/uploadImageMiddleware');

router.get('/', equipoController.obtenerEquiposActivos);
router.get('/totalEquipos', equipoController.contarEquiposActivos);
router.delete('/eliminarActivoComputadora/:equipoId', equipoController.eliminarEquipo);
router.post("/agregarActivoComputadora", equipoController.agregarEquipo);
router.post("/agregarComponentes", equipoController.agregarComponentes);
router.post("/upload", upload.single("image"), equipoController.uploadImage);
module.exports = router;