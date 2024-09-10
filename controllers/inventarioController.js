const sequelize = require('../models/index.js').sequelize;

async function inventarioPorSerie(req, res) {
    const { perifericoId, marcaId, modeloId, serieId } = req.query;

    try {
      const query = `
       SELECT DISTINCT e.inventario
FROM equipo e
JOIN periferico p ON e.id_periferico = p.id_periferico
JOIN marca_periferico mp ON p.id_periferico = mp.id_periferico
JOIN marca_modelo mm ON mp.id_marca = mm.id_marca
JOIN modelo_serie ms ON mm.id_modelo = ms.id_modelo
WHERE (:perifericoId IS NULL OR p.id_periferico = :perifericoId)
AND (:marcaId IS NULL OR mm.id_marca = :marcaId)
AND (:modeloId IS NULL OR mm.id_modelo = :modeloId)
AND (:serieId IS NULL OR ms.id_serie = :serieId);
      `;
  
      const inventarios = await sequelize.query(query, {
        replacements: {
          perifericoId: perifericoId || null,
          marcaId: marcaId || null,
          modeloId: modeloId || null,
          serieId: serieId || null,
        },
        type: sequelize.QueryTypes.SELECT,
      });
  
      res.json(inventarios);
    } catch (error) {
      console.error('Error al obtener inventarios:', error);
      res.status(500).json({ error: 'Error al obtener inventarios' });
    }
  };

module.exports = {
    inventarioPorSerie,
  };
