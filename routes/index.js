const express = require('express');
const router = express.Router();

const perifericos = require('./perifericoRoutes');
const marcas = require('./marcaRoutes');
const modelos = require('./modeloRoutes');
const series = require('./serieRoutes');
const inventarios = require('./inventarioRoutes');
const equipos = require('./equipoRoutes');
const usos = require('./usoRoutes'); 
const usuarios = require('./usuarioRoutes'); 

router.use('/perifericos', perifericos);
router.use('/marcas', marcas);
router.use('/modelos', modelos);
router.use('/series', series);
router.use('/inventarios', inventarios);
router.use('/equipos', equipos);
router.use('/usos', usos); 
router.use('/usuarios', usuarios); 


module.exports = router;
