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

export async function editarSistemaOperativo(req, res) {
  const { id_sistemaoperativo, nuevoNombre } = req.body;

  try {
    const sistema_operativo = await SistemaOperativo.findByPk(id_sistemaoperativo);

    if (!sistema_operativo) {
      return res.status(404).json({ error: 'Sistema Operativo no encontrado' });
    }

    await sistema_operativo.update({ nombre: nuevoNombre });

    return res.json({ message: 'Sistema Operativo actualizado correctamente', sistema_operativo });
  } catch (error) {
    console.error('Error al actualizar el Sistema Operativo:', error);
    return res.status(500).json({ error: 'Error al actualizar el sistema operativo' });
  }
}

export async function eliminarSistemaOperativo(req, res) {
  const { id_sistemaoperativo } = req.params;

  try {
    const sistema_operativo = await SistemaOperativo.findByPk(id_sistemaoperativo);

    if (!sistema_operativo) {
      return res.status(404).json({ error: 'Sistema Operativo no encontrado' });
    }

    const versionesRelacionadas = await db.query(
      `SELECT COUNT(*) as count FROM version_so WHERE id_sistemaoperativo = :id_sistemaoperativo`,
      {
        replacements: { id_sistemaoperativo },
        type: QueryTypes.SELECT
      }
    );

    if (versionesRelacionadas[0].count > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar el Sistema Operativo porque tiene versiones asociadas' 
      });
    }

    await sistema_operativo.destroy();

    return res.json({ message: 'Sistema Operativo eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar el Sistema Operativo:', error);
    return res.status(500).json({ error: 'Error al eliminar el Sistema Operativo' });
  }
}