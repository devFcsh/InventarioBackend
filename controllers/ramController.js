const { ram } = require('../models'); 

async function obtenerRAM(req, res) {
  try {
    const rams = await ram.findAll({
      attributes: ['id_ram', 'tipo', 'capacidad'] 
    });

    return res.json(rams);

  } catch (error) {
    console.error('Error al obtener las RAM:', error);
    return res.status(500).json({ error: 'Error al obtener las RAM' });
  }
}

module.exports = {
  obtenerRAM,
};