var express = require('express');
var router = express.Router();

const sequelize = require('../models/index.js').sequelize;
var initModels = require("../models/init-models");
var models = initModels(sequelize);

router.get('/perifericos', async function(req, res, next) {
  try {
    let perifericosCollection = await models.periferico.findAll();
    res.json(perifericosCollection); // Enviamos la colección de marcas como respuesta en formato JSON
  } catch (error) {
    next(error); // Pasamos el error al manejador de errores
  }
});

module.exports = router;
