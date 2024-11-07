import {QueryTypes } from 'sequelize';
import db from '../models/index.js';

export async function obtenerUsuarios(req, res) {
  const {
    usoId,
    usuarioId,
    limit,
    offset,
  } = req.query;

  try {
    const query = `
      SELECT 
        u.id_usuario, 
        us.nombre AS uso, 
        u.nombre,
        COUNT(*) OVER() AS total
      FROM usuario u
      JOIN uso us ON u.id_uso = us.id_uso
      WHERE (:usoId IS NULL OR us.id_uso = :usoId)
        AND (:usuarioId IS NULL OR u.id_usuario = :usuarioId)
      LIMIT :limit OFFSET :offset;
    `;

    const usuarios = await db.query(query, {
      replacements: {
        usoId: usoId || null,
        usuarioId: usuarioId || null,
        limit: parseInt(limit, 10) || 10,
        offset: parseInt(offset, 10) || 0,
      },
      type: QueryTypes.SELECT,
    });

    const total = usuarios.length > 0 ? usuarios[0].total : 0;

    res.json({ total, usuarios });
  } catch (error) {
    console.error('Error al obtener los usuarios:', error);
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
}

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

export async function agregarUsuarioConUso(req, res) { }