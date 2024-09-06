const express = require('express');
const uso = require('../controllers/usoController');
const router = express.Router();

router.get('/', uso.obtenerUsos); 

module.exports = router;
