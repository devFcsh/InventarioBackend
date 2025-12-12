import {QueryTypes } from 'sequelize';
import db from '../models/index.js';
import Dominio from '../models/dominio.js';

export async function obtenerDominios(req, res) {
  try {
    const dominios = await Dominio.findAll({
      attributes: ['id_dominio', 'nombre'] 
    });

    return res.json(dominios);

  } catch (error) {
    console.error('Error al obtener los dominios:', error);
    return res.status(500).json({ error: 'Error al obtener los dominios' });
  }
}

export async function editarDominio(req, res) {
  const { id_dominio, nuevoNombre } = req.body;

  try {
    const dominio = await Dominio.findByPk(id_dominio);

    if (!dominio) {
      return res.status(404).json({ error: 'Dominio no encontrado' });
    }

    await dominio.update({ nombre: nuevoNombre });

    return res.json({ message: 'Dominio actualizado correctamente', dominio });
  } catch (error) {
    console.error('Error al actualizar el dominio:', error);
    return res.status(500).json({ error: 'Error al actualizar el dominio' });
  }
}

export async function agregarDominio(req, res) {
  const { nombre } = req.body;

  if (!nombre) {
    return res
      .status(400)
      .json({ error: "Se requiere el nombre" });
  }

  try {
    const query = `
      INSERT INTO dominio (nombre)
      VALUES (:nombre)
    `;

    const result = await db.query(query, {
      replacements: { nombre },
      type: QueryTypes.INSERT,
    });

    res.status(201).json({
      mensaje: "Dominio agregado exitosamente",
      dominio: { nombre },
      id_dominio: result[0],
    });
  } catch (error) {
    console.error("Error al agregar el dominio:", error);
    res.status(500).json({ error: "Error al agregar el dominio" });
  }
}

export async function eliminarDominio(req, res) {
  const { id_dominio } = req.params;

  try {
    const dominio = await Dominio.findByPk(id_dominio);

    if (!dominio) {
      return res.status(404).json({ error: 'Dominio no encontrado' });
    }

    const computadorasRelacionadas = await db.query(
      `SELECT COUNT(*) as count FROM computadora WHERE id_dominio = :id_dominio`,
      {
        replacements: { id_dominio },
        type: QueryTypes.SELECT
      }
    );

    if (computadorasRelacionadas[0].count > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar el dominio porque tiene computadoras asociadas' 
      });
    }

    await dominio.destroy();

    return res.json({ message: 'Dominio eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar el dominio:', error);
    return res.status(500).json({ error: 'Error al eliminar el dominio' });
  }
}