import {QueryTypes } from 'sequelize';
import db from '../models/index.js';
import  Ram  from '../models/ram.js'; 

export async function obtenerRAM(req, res) {
  try {
    const rams = await Ram.findAll({
      attributes: ['id_ram', 'tipo', 'capacidad'] 
    });

    return res.json(rams);

  } catch (error) {
    console.error('Error al obtener las RAM:', error);
    return res.status(500).json({ error: 'Error al obtener las RAM' });
  }
}

export async function agregarRAM(req, res) {
  const { tipo, capacidad } = req.body;

  if (!tipo || !capacidad) {
    return res
      .status(400)
      .json({ error: "Se requiere el tipo y capacidad" });
  }

  try {
    const query = `
      INSERT INTO ram (tipo, capacidad)
      VALUES (:tipo, :capacidad)
    `;

    const result = await db.query(query, {
      replacements: { tipo, capacidad },
      type: QueryTypes.INSERT,
    });

    res.status(201).json({
      mensaje: "Ram agregada exitosamente",
      ram: { tipo, capacidad },
      id_ram: result[0],
    });
  } catch (error) {
    console.error("Error al agregar ram:", error);
    res.status(500).json({ error: "Error al agregar ram" });
  }
}

export async function editarRAM(req, res) {
  const { id_ram, nuevoNombre } = req.body;

  try {
    const ram = await Ram.findByPk(id_ram);

    if (!ram) {
      return res.status(404).json({ error: 'Ram no encontrado' });
    }

    await ram.update({ nombre: nuevoNombre });

    return res.json({ message: 'Ram actualizado correctamente', ram });
  } catch (error) {
    console.error('Error al actualizar el ram:', error);
    return res.status(500).json({ error: 'Error al actualizar el ram' });
  }
}

export async function eliminarRAM(req, res) {
  const { id_ram } = req.params;

  try {
    const ram = await Ram.findByPk(id_ram);

    if (!ram) {
      return res.status(404).json({ error: 'Ram no encontrado' });
    }

    await ram.destroy();

    return res.json({ message: 'Ram eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar el ram:', error);
    return res.status(500).json({ error: 'Error al eliminar el ram' });
  }
}