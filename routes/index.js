const express = require('express');
const router = express.Router();

const equipoRoutes = require('./equipoRoutes');
const perifericos = require('./periferico');
const marcas = require('./marca');

router.use('/equipos', equipoRoutes);
router.use('/perifericos', perifericos);
router.use('/marcas', marcas);


module.exports = router;
