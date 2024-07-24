const express = require('express');
const router = express.Router();
const equipoController = require('../controllers/equipoController');

router.get('/', equipoController.getAllEquipos);
router.get('/:id', equipoController.getEquipoById);
router.post('/', equipoController.createEquipo);
router.put('/:id', equipoController.updateEquipo);
router.delete('/:id', equipoController.deleteEquipo);

module.exports = router;
