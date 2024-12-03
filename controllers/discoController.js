import {QueryTypes } from 'sequelize';
import db from '../models/index.js';
import  Disco  from '../models/disco.js'; 

export async function obtenerDiscos(req, res) {
  try {
    const discos = await Disco.findAll({
      attributes: ['id_disco', 'capacidad'] 
    });

    return res.json(discos);

  } catch (error) {
    console.error('Error al obtener los discos:', error);
    return res.status(500).json({ error: 'Error al obtener los discos' });
  }
}

export async function agregarDisco(req, res) {
  const { capacidad } = req.body;

  if (!capacidad) {
    return res
      .status(400)
      .json({ error: "Se requiere la capacidad" });
  }

  try {
    const query = `
      INSERT INTO disco (capacidad)
      VALUES (:capacidad)
    `;

    const result = await db.query(query, {
      replacements: { capacidad },
      type: QueryTypes.INSERT,
    });

    res.status(201).json({
      mensaje: "Disco agregado exitosamente",
      disco: { capacidad },
      id_disco: result[0],
    });
  } catch (error) {
    console.error("Error al agregar el disco:", error);
    res.status(500).json({ error: "Error al agregar el disco" });
  }
}