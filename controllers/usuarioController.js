import {QueryTypes } from 'sequelize';
import db from '../models/index.js';

export async function obtenerUsuariosPorUso(req, res) {
  const { idUso } = req.params;

  try {
    const results = await db.query(
      `SELECT u.id_usuario, u.nombre 
       FROM usuario u
       JOIN uso us ON u.id_uso = us.id_uso
       WHERE us.id_uso = :idUso`,
      {
        replacements: { idUso: idUso },
        type: QueryTypes.SELECT
      }
    );

    if (!Array.isArray(results)) {
      return res.status(500).json({ error: 'Unexpected response format' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'No se encontraron usuarios para el uso seleccionado' });
    }

    return res.json(results); 
  } catch (error) {
    console.error('Error al obtener los usuarios:', error);
    return res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
}

