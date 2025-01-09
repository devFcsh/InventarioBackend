import {QueryTypes } from 'sequelize';
import db from '../models/index.js';
import  Ubicacion  from '../models/ubicacion.js';

export async function obtenerUbicaciones(req, res) {
  const { id_edificio } = req.params; 

  try {
    const ubicaciones = await Ubicacion.findAll({
      attributes: ['id_ubicacion', 'nombre'],
      where: {
        id_edificio: id_edificio, 
      },
    });

    return res.json(ubicaciones);

  } catch (error) {
    console.error('Error al obtener las ubicaciones:', error);
    return res.status(500).json({ error: 'Error al obtener las ubicaciones' });
  }
}

export async function obtenerUbicacionesCompletas(req, res) {

  try {
    const ubicaciones = await Ubicacion.findAll({
      attributes: ['id_ubicacion', 'nombre'],
    });

    return res.json(ubicaciones);

  } catch (error) {
    console.error('Error al obtener las ubicaciones:', error);
    return res.status(500).json({ error: 'Error al obtener las ubicaciones' });
  }
}

export async function agregarUbicacion(req, res) {
  const { nombre, edificioId } = req.body;

  if (!nombre || !edificioId) {
    return res
      .status(400)
      .json({ error: "Se requiere tanto el nombre como el ID de edificio" });
  }

  try {
    const query = `
      INSERT INTO ubicacion (nombre, id_edificio)
      VALUES (:nombre, :edificioId)
    `;

    const result = await db.query(query, {
      replacements: { nombre, edificioId },
      type: QueryTypes.INSERT,
    });

    res.status(201).json({
      mensaje: "Ubicacion agregada exitosamente",
      ubicacion: { nombre, edificioId },
      id_ubicacion: result[0],
    });
  } catch (error) {
    console.error("Error al agregar el ubicacion:", error);
    res.status(500).json({ error: "Error al agregar el ubicacion" });
  }
}
