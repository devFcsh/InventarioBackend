const express = require('express');
const router = express.Router();

const equipoRoutes = require('./equipoRoutes');

router.use('/equipos', equipoRoutes);

module.exports = router;
