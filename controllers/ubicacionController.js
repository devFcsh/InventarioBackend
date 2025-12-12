import {QueryTypes } from 'sequelize';
import db from '../models/index.js';
import  Ubicacion  from '../models/ubicacion.js';

export async function obtenerUbicaciones(req, res) {
  const { id_edificio } = req.params; 

  try {
    const ubicaciones = await Ubicacion.findAll({
      attributes: ['id_ubicacion', 'nombre'],
      where: {
        id_edificio: id_edificio, 
      },
    });

    return res.json(ubicaciones);

  } catch (error) {
    console.error('Error al obtener las ubicaciones:', error);
    return res.status(500).json({ error: 'Error al obtener las ubicaciones' });
  }
}

export async function obtenerUbicacionesCompletas(req, res) {

  try {
    const ubicaciones = await Ubicacion.findAll({
      attributes: ['id_ubicacion', 'nombre'],
    });

    return res.json(ubicaciones);

  } catch (error) {
    console.error('Error al obtener las ubicaciones:', error);
    return res.status(500).json({ error: 'Error al obtener las ubicaciones' });
  }
}

export async function agregarUbicacion(req, res) {
  const { nombre, edificioId } = req.body;

  if (!nombre || !edificioId) {
    return res
      .status(400)
      .json({ error: "Se requiere tanto el nombre como el ID de edificio" });
  }

  try {
    const query = `
      INSERT INTO ubicacion (nombre, id_edificio)
      VALUES (:nombre, :edificioId)
    `;

    const result = await db.query(query, {
      replacements: { nombre, edificioId },
      type: QueryTypes.INSERT,
    });

    res.status(201).json({
      mensaje: "Ubicacion agregada exitosamente",
      ubicacion: { nombre, edificioId },
      id_ubicacion: result[0],
    });
  } catch (error) {
    console.error("Error al agregar el ubicacion:", error);
    res.status(500).json({ error: "Error al agregar el ubicacion" });
  }
}

export async function editarUbicacion(req, res) {
  const { id_ubicacion, nuevoNombre } = req.body;

  try {
    const ubicacion = await Ubicacion.findByPk(id_ubicacion);

    if (!ubicacion) {
      return res.status(404).json({ error: 'Ubicacion no encontrado' });
    }

    await ubicacion.update({ nombre: nuevoNombre });

    return res.json({ message: 'Ubicacion actualizado correctamente', ubicacion });
  } catch (error) {
    console.error('Error al actualizar el ubicacion:', error);
    return res.status(500).json({ error: 'Error al actualizar el ubicacion' });
  }
}

export async function eliminarUbicacion(req, res) {
  const { id_ubicacion } = req.params;

  try {
    const ubicacion = await Ubicacion.findByPk(id_ubicacion);

    if (!ubicacion) {
      return res.status(404).json({ error: 'Ubicación no encontrada' });
    }

    const equiposActivos = await db.query(
      `SELECT COUNT(*) as count FROM equipo_activo WHERE id_ubicacion = :id_ubicacion`,
      {
        replacements: { id_ubicacion },
        type: QueryTypes.SELECT
      }
    );

    if (equiposActivos[0].count > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar la ubicación porque tiene equipos activos asociados' 
      });
    }

    const equiposBodega = await db.query(
      `SELECT COUNT(*) as count FROM equipo_bodega WHERE id_ubicacion = :id_ubicacion`,
      {
        replacements: { id_ubicacion },
        type: QueryTypes.SELECT
      }
    );

    if (equiposBodega[0].count > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar la ubicación porque tiene equipos en bodega asociados' 
      });
    }

    const equiposBaja = await db.query(
      `SELECT COUNT(*) as count FROM equipo_baja WHERE id_ubicacion = :id_ubicacion`,
      {
        replacements: { id_ubicacion },
        type: QueryTypes.SELECT
      }
    );

    if (equiposBaja[0].count > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar la ubicación porque tiene equipos dados de baja asociados' 
      });
    }

    await ubicacion.destroy();

    return res.json({ message: 'Ubicación eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar la ubicación:', error);
    return res.status(500).json({ error: 'Error al eliminar la ubicación' });
  }
}