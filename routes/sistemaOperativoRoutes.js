const express = require('express');
const router = express.Router();
const sistemaOperativoController = require('../controllers/sistemaOperativoController');

router.get('/', sistemaOperativoController.obtenerSO);

module.exports = router;