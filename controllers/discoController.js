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

export async function editarDisco(req, res) {
  const { id_disco, nuevoNombre } = req.body;

  try {
    const disco = await Disco.findByPk(id_disco);

    if (!disco) {
      return res.status(404).json({ error: 'Disco no encontrado' });
    }

    await disco.update({ capacidad: nuevoNombre });

    return res.json({ message: 'Disco actualizado correctamente', disco });
  } catch (error) {
    console.error('Error al actualizar el disco:', error);
    return res.status(500).json({ error: 'Error al actualizar el disco' });
  }
}

export async function eliminarDisco(req, res) {
  const { id_disco } = req.params;

  try {
    const disco = await Disco.findByPk(id_disco);

    if (!disco) {
      return res.status(404).json({ error: 'Disco no encontrado' });
    }

    const computadorasRelacionadas = await db.query(
      `SELECT COUNT(*) as count FROM computadora WHERE id_disco = :id_disco`,
      {
        replacements: { id_disco },
        type: QueryTypes.SELECT
      }
    );

    if (computadorasRelacionadas[0].count > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar el disco porque tiene computadoras asociadas' 
      });
    }

    await disco.destroy();

    return res.json({ message: 'Disco eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar el disco:', error);
    return res.status(500).json({ error: 'Error al eliminar el disco' });
  }
}
