const express = require('express');
const router = express.Router();
const aulaController = require('../controllers/aulaController');

router.get('/:id_edificio', aulaController.obtenerAulas);

module.exports = router;