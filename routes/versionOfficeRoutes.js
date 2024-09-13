const express = require('express');
const router = express.Router();
const versionOfficeController = require('../controllers/versionOfficeController');

router.get('/', versionOfficeController.obtenerVersionesOffice);

module.exports = router;