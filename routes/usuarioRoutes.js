const express = require('express');
const usuario = require('../controllers/usuarioController');
const router = express.Router();

router.get('/usuariosPorUso/:idUso', usuario.obtenerUsuariosPorUso); 

module.exports = router;
