import {QueryTypes } from 'sequelize';
import db from '../models/index.js';
import Edificio from "../models/edificio.js";

export async function obtenerEdificios(req, res) {

  try {
    const edificios = await Edificio.findAll({
      attributes: ['id_edificio', 'nombre']
    });

    return res.json(edificios);

  } catch (error) {
    console.error('Error al obtener edificios:', error);
    return res.status(500).json({ error: 'Error al obtener edificios' });
  }
}

export async function agregarEdificio(req, res) {
  const { nombre } = req.body;

  if (!nombre) {
    return res
      .status(400)
      .json({ error: "Se requiere el nombre" });
  }

  try {
    const query = `
      INSERT INTO edificio (nombre)
      VALUES (:nombre)
    `;

    const result = await db.query(query, {
      replacements: { nombre },
      type: QueryTypes.INSERT,
    });

    res.status(201).json({
      mensaje: "Edificio agregado exitosamente",
      edificio: { nombre },
      id_edificio: result[0],
    });
  } catch (error) {
    console.error("Error al agregar el edificio:", error);
    res.status(500).json({ error: "Error al agregar el edificio" });
  }
}

export async function editarEdificio(req, res) {
  const { id_edificio, nuevoNombre } = req.body;

  try {
    const edificio = await Edificio.findByPk(id_edificio);

    if (!edificio) {
      return res.status(404).json({ error: 'Edificio no encontrado' });
    }

    await edificio.update({ nombre: nuevoNombre });

    return res.json({ message: 'Edficio actualizado correctamente', edificio });
  } catch (error) {
    console.error('Error al actualizar el edificio:', error);
    return res.status(500).json({ error: 'Error al actualizar el edificio' });
  }
}
