const express = require('express');
const router = express.Router();
const equipoController = require('../controllers/equipoController'); 
const upload = require('../middlewares/uploadImageMiddleware');

router.get('/', equipoController.obtenerEquiposActivos);
router.get('/computadora/:id', equipoController.obtenerComputadora);
router.get('/totalEquipos', equipoController.contarEquiposActivos);
router.delete('/computadora/:equipoId', equipoController.eliminarEquipo);
router.put('/darDeBajaEquipo/:equipoId', equipoController.darDeBajaEquipo);
router.post("/agregarActivoComputadora", equipoController.agregarEquipo);
router.post("/agregarComponentes", equipoController.agregarComponentes);
router.post("/upload", upload.single("image"), equipoController.uploadImage);
module.exports = router;