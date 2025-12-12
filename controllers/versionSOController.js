import {QueryTypes } from 'sequelize';
import db from '../models/index.js';
import  VersionSo  from '../models/version_so.js';

export async function obtenerVersionesCompletasSO(req, res) {

  try {
    const versionesSO = await VersionSo.findAll({
      attributes: ['id_versionso', 'nombre'],
    });

    return res.json(versionesSO);

  } catch (error) {
    console.error('Error al obtener las versiones de SOs:', error);
    return res.status(500).json({ error: 'Error al obtener las versiones de SOs' });
  }
}

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
      INSERT INTO version_so (nombre, id_sistemaoperativo)
      VALUES (:nombre, :sistemaoperativoId)
    `;
    const resultVersionSO = await db.query(queryVersionSO, {
      replacements: { nombre, sistemaoperativoId },
      type: QueryTypes.INSERT,
    });

    const id_versionso = resultVersionSO[0];

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

export async function editarVersionSO(req, res) {
  const { id_versionso, nuevoNombre } = req.body;

  try {
    const version_SO = await VersionSo.findByPk(id_versionso);

    if (!version_SO) {
      return res.status(404).json({ error: 'Version SO no encontrado' });
    }

    await version_SO.update({ nombre: nuevoNombre });

    return res.json({ message: 'Version SO actualizado correctamente', version_SO });
  } catch (error) {
    console.error('Error al actualizar el version SO:', error);
    return res.status(500).json({ error: 'Error al actualizar el version SO' });
  }
}

export async function eliminarVersionSO(req, res) {
  const { id_versionso } = req.params;

  try {
    const version_so = await VersionSo.findByPk(id_versionso);

    if (!version_so) {
      return res.status(404).json({ error: 'Versión de SO no encontrada' });
    }

    const computadorasRelacionadas = await db.query(
      `SELECT COUNT(*) as count FROM computadora WHERE id_versionso = :id_versionso`,
      {
        replacements: { id_versionso },
        type: QueryTypes.SELECT
      }
    );

    if (computadorasRelacionadas[0].count > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar la versión de SO porque tiene computadoras asociadas' 
      });
    }

    await version_so.destroy();

    return res.json({ message: 'Versión de SO eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar versión de SO:', error);
    return res.status(500).json({ error: 'Error al eliminar versión de SO' });
  }
}