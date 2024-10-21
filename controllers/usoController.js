import {QueryTypes } from 'sequelize';
import db from '../models/index.js';

export async function obtenerUsos(req, res) {
  try {
    const results = await db.query(
      `SELECT * FROM uso`, 
      { type: QueryTypes.SELECT }
    );

    if (!Array.isArray(results)) {
      return res.status(500).json({ error: 'Unexpected response format' });
    }

    return res.json(results); 
  } catch (error) {
    console.error('Error al obtener los usos:', error);
    return res.status(500).json({ error: 'Error al obtener los usos' });
  }
}
