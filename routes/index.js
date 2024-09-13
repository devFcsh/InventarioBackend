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
const discos = require('./discoRoutes'); 
const dominios = require('./dominioRoutes'); 
const ram = require('./ramRoutes'); 
const sistemasoperativos = require('./sistemaOperativoRoutes'); 
const versionesSO = require('./versionSORoutes'); 
const versionesOffice = require('./versionOfficeRoutes'); 
const edificios = require('./edificioRoutes'); 
const aulas = require('./aulaRoutes'); 

router.use('/perifericos', perifericos);
router.use('/marcas', marcas);
router.use('/modelos', modelos);
router.use('/series', series);
router.use('/inventarios', inventarios);
router.use('/equipos', equipos);
router.use('/usos', usos); 
router.use('/usuarios', usuarios); 
router.use('/discos', discos); 
router.use('/dominios', dominios); 
router.use('/ram', ram); 
router.use('/sistemasoperativos', sistemasoperativos);
router.use('/versionesSO', versionesSO);  
router.use('/versionesOffice', versionesOffice);  
router.use('/edificios', edificios);  
router.use('/aulas', aulas);  

module.exports = router;
