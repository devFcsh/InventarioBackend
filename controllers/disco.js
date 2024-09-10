const { disco } = require('../models'); 

async function obtenerDiscos(req, res) {
  try {
    const discos = await disco.findAll({
      attributes: ['id_disco', 'capacidad'] 
    });

    return res.json(discos);

  } catch (error) {
    console.error('Error al obtener los discos:', error);
    return res.status(500).json({ error: 'Error al obtener los discos' });
  }
}

module.exports = {
  obtenerDiscos,
};