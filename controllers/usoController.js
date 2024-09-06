const { sequelize } = require('../models');

async function obtenerUsos(req, res) {
  try {
    const results = await sequelize.query(
      `SELECT * FROM uso`, 
      { type: sequelize.QueryTypes.SELECT }
    );

    if (!Array.isArray(results)) {
      return res.status(500).json({ error: 'Unexpected response format' });
    }

    return res.json(results); 
  } catch (error) {
    console.error('Error al obtener los usos:', error);
    return res.status(500).json({ error: 'Error al obtener los usos' });
  }
}

module.exports = {
  obtenerUsos,
};
