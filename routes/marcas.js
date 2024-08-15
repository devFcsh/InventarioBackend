var express = require('express');
var router = express.Router();

const sequelize = require('../models/index.js').sequelize;
var initModels = require("../models/init-models");
var models = initModels(sequelize);

router.get('/marcas', async function(req, res, next) {
  try {
    let marcasCollection = await models.marca.findAll();
    res.json(marcasCollection); // Enviamos la colección de marcas como respuesta en formato JSON
  } catch (error) {
    next(error); // Pasamos el error al manejador de errores
  }
});

module.exports = router;
