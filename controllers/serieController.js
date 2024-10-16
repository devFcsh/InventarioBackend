import { sequelize } from '../models/index.js';
import { serie } from '../models'; 

async function obtenerSeries(req, res) {
  try {
    const series = await serie.findAll({
      attributes: ['id_serie', 'nombre'] 
    });

    return res.json(series);

  } catch (error) {
    console.error('Error al obtener las series:', error);
    return res.status(500).json({ error: 'Error al obtener las series' });
  }
}

async function seriesPorModelo(req, res) {
    const { perifericoId, marcaId, modeloId } = req.query;

    try {
      const query = `
        SELECT DISTINCT s.id_serie, s.nombre
        FROM modelo_serie ms
        JOIN serie s ON ms.id_serie = s.id_serie
        JOIN marca_modelo mm ON ms.id_modelo = mm.id_modelo
        JOIN marca_periferico mp ON mm.id_marca = mp.id_marca
        WHERE (:perifericoId IS NULL OR mp.id_periferico = :perifericoId)
        AND (:marcaId IS NULL OR mm.id_marca = :marcaId)
        AND (:modeloId IS NULL OR ms.id_modelo = :modeloId);
      `;
  
      const series = await sequelize.query(query, {
        replacements: {
          perifericoId: perifericoId || null,
          marcaId: marcaId || null,
          modeloId: modeloId || null,
        },
        type: sequelize.QueryTypes.SELECT,
      });
  
      res.json(series);
    } catch (error) {
      console.error('Error al obtener series:', error);
      res.status(500).json({ error: 'Error al obtener series' });
    }
  };  

export default {
    seriesPorModelo,
    obtenerSeries,
  };
