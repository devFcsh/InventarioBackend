import {QueryTypes } from 'sequelize';
import db from '../models/index.js';
import  VersionSo  from '../models/version_so.js';

export async function obtenerVersionesSO(req, res) {
  const { id_sistemaoperativo } = req.params; 

  try {
    const versionesSO = await VersionSo.findAll({
      attributes: ['id_versionso', 'nombre'],
      where: {
        id_sistemaoperativo: id_sistemaoperativo, 
      },
    });

    return res.json(versionesSO);

  } catch (error) {
    console.error('Error al obtener las versiones de SOs:', error);
    return res.status(500).json({ error: 'Error al obtener las versiones de SOs' });
  }
}

export async function agregarVersionSO(req, res) {
  const { nombre, sistemaoperativoId } = req.body;

  if (!nombre || !sistemaoperativoId) {
    return res
      .status(400)
      .json({ error: "Se requiere tanto el nombre como el ID de SO" });
  }

  try {
    const queryVersionSO = `
      INSERT INTO version_so (nombre)
      VALUES (:nombre)
    `;
    const resultVersionSO = await db.query(queryVersionSO, {
      replacements: { nombre },
      type: QueryTypes.INSERT,
    });

    const id_versionso = resultVersionSO[0];

    const queryModeloSerie = `
      INSERT INTO modelo_serie (id_modelo, id_serie)
      VALUES (:sistemaoperativoId, :id_versionso)
    `;
    await db.query(queryModeloSerie, {
      replacements: { sistemaoperativoId, id_versionso },
      type: QueryTypes.INSERT,
    });

    res.status(201).json({
      mensaje: "Version SO agregada y asociada exitosamente al SO",
      version_so: { nombre },
      id_versionso,
      id_sistemaoperativo: sistemaoperativoId,
    });
  } catch (error) {
    console.error("Error al agregar Version SO y asociar SO:", error);
    res.status(500).json({ error: "Error al agregar Version SO y asociar SO" });
  }
}
