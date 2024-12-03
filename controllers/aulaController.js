import {QueryTypes } from 'sequelize';
import db from '../models/index.js';
import  Aula  from '../models/aula.js';

export async function obtenerAulas(req, res) {
  const { id_edificio } = req.params; 

  try {
    const aulas = await Aula.findAll({
      attributes: ['id_aula', 'nombre'],
      where: {
        id_edificio: id_edificio, 
      },
    });

    return res.json(aulas);

  } catch (error) {
    console.error('Error al obtener las aulas:', error);
    return res.status(500).json({ error: 'Error al obtener las aulas' });
  }
}

export async function agregarAula(req, res) {
  const { nombre, edificioId } = req.body;

  if (!nombre || !edificioId) {
    return res
      .status(400)
      .json({ error: "Se requiere tanto el nombre como el ID de edificio" });
  }

  try {
    const query = `
      INSERT INTO aula (nombre, id_edificio)
      VALUES (:nombre, :edificioId)
    `;

    const result = await db.query(query, {
      replacements: { nombre, edificioId },
      type: QueryTypes.INSERT,
    });

    res.status(201).json({
      mensaje: "Aula agregada exitosamente",
      aula: { nombre, edificioId },
      id_aula: result[0],
    });
  } catch (error) {
    console.error("Error al agregar el aula:", error);
    res.status(500).json({ error: "Error al agregar el aula" });
  }
}
