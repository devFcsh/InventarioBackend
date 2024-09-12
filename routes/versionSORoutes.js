const express = require('express');
const router = express.Router();
const versionSOController = require('../controllers/versionSOController');

router.get('/:id_sistemaoperativo', versionSOController.obtenerVersionesSO);

module.exports = router;