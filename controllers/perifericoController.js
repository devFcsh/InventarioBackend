const sequelize = require('../models/index.js').sequelize;
var initModels = require("../models/init-models.js");
var models = initModels(sequelize);

async function obtenerPerifericos(req, res, next) {
  try {
    let perifericosCollection = await models.periferico.findAll();
    res.json(perifericosCollection); 
  } catch (error) {
    next(error); 
  }
}

module.exports = {
  obtenerPerifericos,
};