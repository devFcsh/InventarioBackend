import {QueryTypes } from 'sequelize';
import db from '../models/index.js';
import  SistemaOperativo  from '../models/sistema_operativo.js'; 

export async function obtenerSO(req, res) {
  try {
    const SOs = await SistemaOperativo.findAll({
      attributes: ['id_sistemaoperativo', 'nombre'] 
    });

    return res.json(SOs);

  } catch (error) {
    console.error('Error al obtener los SOs:', error);
    return res.status(500).json({ error: 'Error al obtener los SOs' });
  }
}

export async function agregarSistemaOperativo(req, res) {
  const { nombre } = req.body;

  if (!nombre) {
    return res
      .status(400)
      .json({ error: "Se requiere el nombre" });
  }

  try {
    const query = `
      INSERT INTO sistema_operativo (nombre)
      VALUES (:nombre)
    `;

    const result = await db.query(query, {
      replacements: { nombre },
      type: QueryTypes.INSERT,
    });

    res.status(201).json({
      mensaje: "Sistema Operativo agregado exitosamente",
      sistema_operativo: { nombre },
      id_sistemaoperativo: result[0],
    });
  } catch (error) {
    console.error("Error al agregar el Sistema Operativo:", error);
    res.status(500).json({ error: "Error al agregar el Sistema Operativo" });
  }
}