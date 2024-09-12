const express = require('express');
const router = express.Router();
const discoController = require('../controllers/discoController');

router.get('/', discoController.obtenerDiscos);

module.exports = router;