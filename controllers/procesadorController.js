import {QueryTypes } from 'sequelize';
import db from '../models/index.js';
import Procesador from '../models/procesador.js';

export async function obtenerProcesadores(req, res) {
  try {
    const procesadores = await Procesador.findAll({
      attributes: ['id_procesador', 'nombre'] 
    });

    return res.json(procesadores);

  } catch (error) {
    console.error('Error al obtener procesadores:', error);
    return res.status(500).json({ error: 'Error al obtener procesadores' });
  }
}

export async function agregarProcesador(req, res) {
    const { nombre } = req.body;
  
    if (!nombre) {
      return res
        .status(400)
        .json({ error: "Se requiere el nombre" });
    }
  
    try {
      const queryProcesador = `
        INSERT INTO procesador (nombre)
        VALUES (:nombre)
      `;
      const resultProcesador = await db.query(queryProcesador, {
        replacements: { nombre },
        type: QueryTypes.INSERT,
      });
  
      const id_procesador = resultProcesador[0];
  
      res.status(201).json({
        mensaje: "Procesador agregado",
        id_procesador,
      });
    } catch (error) {
      console.error("Error al agregar procesador:", error);
      res.status(500).json({ error: "Error al agregar procesador" });
    }
  }
  