const express = require('express');
const router = express.Router();
const edificioController = require('../controllers/edificioController');

router.get('/', edificioController.obtenerEdificios);

module.exports = router;