const sequelize = require('../models/index.js').sequelize;
var initModels = require("../models/init-models.js");
var models = initModels(sequelize);

async function obtenerEquipos(req, res) {
    const { perifericoId, marcaId, modeloId, serieId, inventario, limit, offset } = req.query;

    try {
      const query = `
        SELECT e.*, p.nombre AS periferico, m.nombre AS marca, mo.nombre AS modelo, s.nombre AS serie
FROM equipo e
JOIN periferico p ON e.id_periferico = p.id_periferico
JOIN marca_periferico mp ON p.id_periferico = mp.id_periferico
JOIN marca m ON mp.id_marca = m.id_marca  -- Correcto uso de alias para la tabla marca
JOIN marca_modelo mm ON m.id_marca = mm.id_marca
JOIN modelo mo ON mm.id_modelo = mo.id_modelo
JOIN modelo_serie ms ON mo.id_modelo = ms.id_modelo
JOIN serie s ON ms.id_serie = s.id_serie
WHERE (:perifericoId IS NULL OR p.id_periferico = :perifericoId)
AND (:marcaId IS NULL OR m.id_marca = :marcaId)
AND (:modeloId IS NULL OR mo.id_modelo = :modeloId)
AND (:serieId IS NULL OR s.id_serie = :serieId)
AND (:inventario IS NULL OR e.inventario = :inventario)
LIMIT :limit OFFSET :offset;

      `;
  
      const equipos = await sequelize.query(query, {
        replacements: {
          perifericoId: perifericoId || null,
          marcaId: marcaId || null,
          modeloId: modeloId || null,
          serieId: serieId || null,
          inventario: inventario || null,
          limit: parseInt(limit, 10) || 10,
          offset: parseInt(offset, 10) || 0
        },
        type: sequelize.QueryTypes.SELECT,
      });
  
      res.json(equipos);
    } catch (error) {
      console.error('Error al obtener equipos:', error);
      res.status(500).json({ error: 'Error al obtener equipos' });
    }
  };

module.exports = {
    obtenerEquipos,
  };
