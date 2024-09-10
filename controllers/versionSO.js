const { version_so } = require('../models'); 

async function obtenerVersionesSO(req, res) {
  try {
    const versionesSO = await version_so.findAll({
      attributes: ['id_versionso', 'nombre'] 
    });

    return res.json(versionesSO);

  } catch (error) {
    console.error('Error al obtener las versiones de SOs:', error);
    return res.status(500).json({ error: 'Error al obtener las versiones de SOs' });
  }
}

module.exports = {
    obtenerVersionesSO,
};