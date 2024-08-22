const express = require('express');
const router = express.Router();

const perifericos = require('./perifericoRoutes');
const marcas = require('./marcaRoutes');

router.use('/perifericos', perifericos);
router.use('/marcas', marcas);


module.exports = router;
