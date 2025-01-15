import {QueryTypes } from 'sequelize';
import db from '../models/index.js';
import Periferico from "../models/periferico.js"

export async function obtenerPerifericos(req, res) {
  try {
    const perifericos = await Periferico.findAll({
      attributes: ['id_periferico', 'nombre'] 
    });

    return res.json(perifericos);

  } catch (error) {
    console.error('Error al obtener los perifericos:', error);
    return res.status(500).json({ error: 'Error al obtener los perifericos' });
  }
}

export async function agregarPeriferico(req, res) {
  const { nombre } = req.body;

  if (!nombre) {
    return res
      .status(400)
      .json({ error: "Se requiere el nombre" });
  }

  try {
    const query = `
      INSERT INTO periferico (nombre)
      VALUES (:nombre)
    `;

    const result = await db.query(query, {
      replacements: { nombre },
      type: QueryTypes.INSERT,
    });

    res.status(201).json({
      mensaje: "Periferico agregado exitosamente",
      periferico: { nombre },
      id_periferico: result[0],
    });
  } catch (error) {
    console.error("Error al agregar el periferico:", error);
    res.status(500).json({ error: "Error al agregar el periferico" });
  }
}

export async function editarPeriferico(req, res) {
  const { id_periferico, nuevoNombre } = req.body;

  try {
    const periferico = await Periferico.findByPk(id_periferico);

    if (!periferico) {
      return res.status(404).json({ error: 'Periferico no encontrado' });
    }

    await periferico.update({ nombre: nuevoNombre });

    return res.json({ message: 'Periferico actualizado correctamente', periferico });
  } catch (error) {
    console.error('Error al actualizar el periferico:', error);
    return res.status(500).json({ error: 'Error al actualizar el periferico' });
  }
}

export async function eliminarPeriferico(req, res) {
  const { id_periferico } = req.params;

  try {
    const periferico = await Periferico.findByPk(id_periferico);

    if (!periferico) {
      return res.status(404).json({ error: 'Periferico no encontrado' });
    }

    await periferico.destroy();

    return res.json({ message: 'Periferico eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar el periferico:', error);
    return res.status(500).json({ error: 'Error al eliminar el periferico' });
  }
}