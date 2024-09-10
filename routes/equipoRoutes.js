const express = require('express');
const router = express.Router();
const equipoController = require('../controllers/equipoController'); 

router.get('/', equipoController.obtenerEquipos);
router.get('/totalEquipos', equipoController.contarEquipos);
router.delete('/eliminarActivoComputadora/:idEquipo', equipoController.eliminarActivoComputadora);
router.delete('/eliminarActivoComponente/:idEquipo', equipoController.eliminarActivoComponente);
router.delete('/eliminarActivoOtro/:idEquipo', equipoController.eliminarActivoOtro);
module.exports = router;