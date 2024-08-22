const { sequelize } = require('../models'); // Asegúrate de que la ruta sea correcta


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
    const [results, metadata] = await sequelize.query(
      `SELECT m.id_marca, m.nombre
       FROM periferico p
       JOIN marca m ON p.id_marca = m.id_marca
       WHERE p.id_periferico = :idPeriferico`, 
      {
        replacements: { idPeriferico }, // Sustituye los parámetros
        type: sequelize.QueryTypes.SELECT // Tipo de query
      }
    );

    if (results.length === 0) {
      throw new Error('Periférico no encontrado');
    }

    return results; // Retorna los resultados de la consulta

  } catch (error) {
    console.error('Error al obtener las marcas:', error);
    return { error: 'Error al obtener las marcas' };
  }
}

module.exports = { obtenerMarcasPorPeriferico };
