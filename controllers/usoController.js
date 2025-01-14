import {QueryTypes } from 'sequelize';
import db from '../models/index.js';
import Uso from '../models/uso.js';

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

export async function agregarUso(req, res) {
  const { nombre } = req.body;

  if (!nombre) {
    return res
      .status(400)
      .json({ error: "Se requiere el nombre" });
  }

  try {
    const query = `
      INSERT INTO uso (nombre)
      VALUES (:nombre)
    `;

    const result = await db.query(query, {
      replacements: { nombre },
      type: QueryTypes.INSERT,
    });

    res.status(201).json({
      mensaje: "Uso agregado exitosamente",
      uso: { nombre },
      id_uso: result[0],
    });
  } catch (error) {
    console.error("Error al agregar el uso:", error);
    res.status(500).json({ error: "Error al agregar el uso" });
  }
}

export async function editarUso(req, res) {
  const { id_uso, nuevoNombre } = req.body;

  try {
    const uso = await Uso.findByPk(id_uso);

    if (!uso) {
      return res.status(404).json({ error: 'Uso no encontrado' });
    }

    await uso.update({ nombre: nuevoNombre });

    return res.json({ message: 'Uso actualizado correctamente', uso });
  } catch (error) {
    console.error('Error al actualizar el uso:', error);
    return res.status(500).json({ error: 'Error al actualizar el uso' });
  }
}