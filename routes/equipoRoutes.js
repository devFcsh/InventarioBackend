const express = require('express');
const router = express.Router();
const equipoController = require('../controllers/equipoController'); 

router.get('/', equipoController.obtenerEquipos);
router.get('/totalEquipos', equipoController.contarEquipos);
router.delete('/eliminarActivoComputadora/:equipoId', equipoController.eliminarActivoComputadora);
router.delete('/eliminarActivoComponente/:equipoId', equipoController.eliminarActivoComponente);
router.delete('/eliminarActivoOtro/:equipoId', equipoController.eliminarActivoOtro);
module.exports = router;