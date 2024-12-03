import {QueryTypes } from 'sequelize';
import db from '../models/index.js';
import  VersionOffice  from '../models/version_office.js';

export async function obtenerVersionesOffice(req, res) {

  try {
    const versionesOffice = await VersionOffice.findAll({
      attributes: ['id_versionoffice', 'nombre']
    });

    return res.json(versionesOffice);

  } catch (error) {
    console.error('Error al obtener las versiones de Office:', error);
    return res.status(500).json({ error: 'Error al obtener las versiones de Office' });
  }
}

export async function agregarVersionOffice(req, res) {
  const { nombre } = req.body;

  if (!nombre) {
    return res
      .status(400)
      .json({ error: "Se requiere el nombre" });
  }

  try {
    const query = `
      INSERT INTO version_office (nombre)
      VALUES (:nombre)
    `;

    const result = await db.query(query, {
      replacements: { nombre },
      type: QueryTypes.INSERT,
    });

    res.status(201).json({
      mensaje: "Versión Office agregada exitosamente",
      version_office: { nombre },
      id_version_office: result[0],
    });
  } catch (error) {
    console.error("Error al agregar Versión Office:", error);
    res.status(500).json({ error: "Error al agregar Versión Office" });
  }
}