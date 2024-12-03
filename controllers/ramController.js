import {QueryTypes } from 'sequelize';
import db from '../models/index.js';
import  Ram  from '../models/ram.js'; 

export async function obtenerRAM(req, res) {
  try {
    const rams = await Ram.findAll({
      attributes: ['id_ram', 'tipo', 'capacidad'] 
    });

    return res.json(rams);

  } catch (error) {
    console.error('Error al obtener las RAM:', error);
    return res.status(500).json({ error: 'Error al obtener las RAM' });
  }
}

export async function agregarRAM(req, res) {
  const { tipo, capacidad } = req.body;

  if (!tipo || !capacidad) {
    return res
      .status(400)
      .json({ error: "Se requiere el tipo y capacidad" });
  }

  try {
    const query = `
      INSERT INTO ram (tipo, capacidad)
      VALUES (:tipo, :capacidad)
    `;

    const result = await db.query(query, {
      replacements: { tipo, capacidad },
      type: QueryTypes.INSERT,
    });

    res.status(201).json({
      mensaje: "Ram agregada exitosamente",
      ram: { tipo, capacidad },
      id_ram: result[0],
    });
  } catch (error) {
    console.error("Error al agregar ram:", error);
    res.status(500).json({ error: "Error al agregar ram" });
  }
}