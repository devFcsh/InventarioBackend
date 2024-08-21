const { Marca, Periferico } = require('../models');

// Obtener las marcas para un cierto periférico
async function getMarcasByPeriferico(perifericoId) {
  try {
    const periferico = await Periferico.findOne({
      where: { id_periferico: perifericoId },
      include: [{ model: Marca }]
    });

    if (periferico) {
      return periferico.marca;
    } else {
      return { error: "Periférico no encontrado" };
    }
  } catch (error) {
    console.error("Error al obtener las marcas:", error);
    return { error: "Error al obtener las marcas" };
  }
}

async function obtenerMarcasPorPeriferico(idPeriferico) {
  try {
      const periferico = await Periferico.findByPk(idPeriferico, {
          include: {
              model: Marca,
              attributes: ['id_marca', 'nombre']
          }
      });

      if (!periferico) {
          throw new Error('Periférico no encontrado');
      }

      console.log(periferico.Marca); // Esto devolverá la marca asociada al periférico
      return periferico.Marca;

  } catch (error) {
      console.error('Error al obtener las marcas:', error);
  }
}

module.exports = { getMarcasByPeriferico, obtenerMarcasPorPeriferico };
