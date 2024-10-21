import {QueryTypes } from 'sequelize';
import db from '../models/index.js';
import  modelo  from '../models/modelo.js'; 

export async function obtenerModelos(req, res) {
    try {
      const modelos = await modelo.findAll({
        attributes: ['id_modelo', 'nombre'] 
      });
  
      return res.json(modelos);
  
    } catch (error) {
      console.error('Error al obtener los modelos:', error);
      return res.status(500).json({ error: 'Error al obtener los modelos' });
    }
}

export async function modelosPorMarcaPeriferico(req, res) {
  const { marcaId, perifericoId } = req.query;

  try {
      const modelos = await db.query(
          `SELECT mo.id_modelo, mo.nombre 
          FROM modelo mo
          JOIN marca_modelo mm ON mo.id_modelo = mm.id_modelo
          JOIN marca_periferico mp ON mm.id_marca = mp.id_marca
          WHERE mp.id_marca = :marcaId AND mp.id_periferico = :perifericoId`,
          {
              replacements: { marcaId, perifericoId },
              type: QueryTypes.SELECT
          }
      );

      if (modelos.length === 0) {
          return res.status(404).json({ error: 'Modelos no encontrados para la marca y periférico seleccionados' });
      }

      return res.json(modelos);

  } catch (error) {
      console.error('Error al obtener los modelos:', error);
      return res.status(500).json({ error: 'Error al obtener los modelos' });
  }
};

