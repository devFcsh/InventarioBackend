import {QueryTypes } from 'sequelize';
import db from '../models/index.js';
import Uso from '../models/uso.js';

export async function obtenerUsos(req, res) {
  try {
    const results = await db.query(
      `SELECT * FROM uso`, 
      { type: QueryTypes.SELECT }
    );

    if (!Array.isArray(results)) {
      return res.status(500).json({ error: 'Unexpected response format' });
    }

    return res.json(results); 
  } catch (error) {
    console.error('Error al obtener los usos:', error);
    return res.status(500).json({ error: 'Error al obtener los usos' });
  }
}

export async function agregarUso(req, res) {
  const { nombre } = req.body;

  if (!nombre) {
    return res
      .status(400)
      .json({ error: "Se requiere el nombre" });
  }

  try {
    const query = `
      INSERT INTO uso (nombre)
      VALUES (:nombre)
    `;

    const result = await db.query(query, {
      replacements: { nombre },
      type: QueryTypes.INSERT,
    });

    res.status(201).json({
      mensaje: "Uso agregado exitosamente",
      uso: { nombre },
      id_uso: result[0],
    });
  } catch (error) {
    console.error("Error al agregar el uso:", error);
    res.status(500).json({ error: "Error al agregar el uso" });
  }
}

export async function editarUso(req, res) {
  const { id_uso, nuevoNombre } = req.body;

  try {
    const uso = await Uso.findByPk(id_uso);

    if (!uso) {
      return res.status(404).json({ error: 'Uso no encontrado' });
    }

    await uso.update({ nombre: nuevoNombre });

    return res.json({ message: 'Uso actualizado correctamente', uso });
  } catch (error) {
    console.error('Error al actualizar el uso:', error);
    return res.status(500).json({ error: 'Error al actualizar el uso' });
  }
}

export async function eliminarUso(req, res) {
  const { id_uso } = req.params;

  try {
    const uso = await Uso.findByPk(id_uso);

    if (!uso) {
      return res.status(404).json({ error: 'Uso no encontrado' });
    }

    const usuariosRelacionados = await db.query(
      `SELECT COUNT(*) as count FROM usuario WHERE id_uso = :id_uso`,
      {
        replacements: { id_uso },
        type: QueryTypes.SELECT
      }
    );

    if (usuariosRelacionados[0].count > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar el uso porque tiene usuarios asociados' 
      });
    }

    const equiposActivos = await db.query(
      `SELECT COUNT(*) as count FROM equipo_activo WHERE id_uso = :id_uso`,
      {
        replacements: { id_uso },
        type: QueryTypes.SELECT
      }
    );

    if (equiposActivos[0].count > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar el uso porque tiene equipos activos asociados' 
      });
    }

    const equiposBodega = await db.query(
      `SELECT COUNT(*) as count FROM equipo_bodega WHERE id_uso = :id_uso`,
      {
        replacements: { id_uso },
        type: QueryTypes.SELECT
      }
    );

    if (equiposBodega[0].count > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar el uso porque tiene equipos en bodega asociados' 
      });
    }

    const equiposBaja = await db.query(
      `SELECT COUNT(*) as count FROM equipo_baja WHERE id_uso = :id_uso`,
      {
        replacements: { id_uso },
        type: QueryTypes.SELECT
      }
    );

    if (equiposBaja[0].count > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar el uso porque tiene equipos dados de baja asociados' 
      });
    }

    await uso.destroy();

    return res.json({ message: 'Uso eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar el uso:', error);
    return res.status(500).json({ error: 'Error al eliminar el uso' });
  }
}